import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import Sqlite from 'better-sqlite3'
import { assertMigrationHistory, loadMigrations } from './shared.mjs'

const defaultDirectory = fileURLToPath(new URL('../../db/migrations/sqlite/', import.meta.url))

export async function migrateSqlite(filename, directory = defaultDirectory) {
  if (!filename || filename === ':memory:') {
    throw new Error('An explicit persistent SQLite path is required')
  }
  const migrations = await loadMigrations(directory)
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
      assertMigrationHistory(migrations, history)
      for (const migration of migrations) {
        if (history.some((row) => row.name === migration.name)) continue
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
