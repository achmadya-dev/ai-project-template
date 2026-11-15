import { mkdir, readdir, readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import Sqlite from 'better-sqlite3'

export async function migrateSqlite(
  filename,
  directory = fileURLToPath(new URL('../db/migrations/sqlite/', import.meta.url)),
) {
  if (!filename || filename === ':memory:') {
    throw new Error('An explicit persistent SQLite path is required')
  }
  const names = (await readdir(directory))
    .filter((name) => /^\d+_[a-z0-9_]+\.sql$/.test(name))
    .sort()
  const migrations = await Promise.all(
    names.map(async (name) => {
      const sql = await readFile(path.join(directory, name), 'utf8')
      return { name, sql, checksum: createHash('sha256').update(sql).digest('hex') }
    }),
  )
  await mkdir(path.dirname(filename), { recursive: true })
  const db = new Sqlite(filename)
  try {
    db.pragma('foreign_keys = ON')
    db.pragma('busy_timeout = 5000')
    db.transaction(() => {
      db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        checksum TEXT NOT NULL,
        applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`)
      const history = db.prepare('SELECT name, checksum FROM schema_migrations ORDER BY name').all()
      for (const row of history) {
        if (!names.includes(row.name)) throw new Error(`Applied migration was removed: ${row.name}`)
      }
      for (const migration of migrations) {
        const applied = history.find((row) => row.name === migration.name)
        if (applied) {
          if (applied.checksum !== migration.checksum) {
            throw new Error(`Applied migration was modified: ${migration.name}`)
          }
          continue
        }
        if (history.some((row) => row.name > migration.name)) {
          throw new Error(`Migration is out of order: ${migration.name}`)
        }
        db.exec(migration.sql)
        db.prepare('INSERT INTO schema_migrations(name, checksum) VALUES (?, ?)').run(
          migration.name,
          migration.checksum,
        )
      }
    }).immediate()
  } finally {
    db.close()
  }
}
