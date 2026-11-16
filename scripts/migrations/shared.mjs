import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const migrationFilename = /^\d+_[a-z0-9_]+\.sql$/

export async function loadMigrations(directory) {
  const names = (await readdir(directory)).filter((name) => migrationFilename.test(name)).sort()
  return Promise.all(
    names.map(async (name) => {
      const sql = await readFile(path.join(directory, name), 'utf8')
      return { name, sql, checksum: createHash('sha256').update(sql).digest('hex') }
    }),
  )
}

export function assertMigrationHistory(migrations, history) {
  const names = migrations.map((migration) => migration.name)
  for (const row of history) {
    if (!names.includes(row.name)) throw new Error(`Applied migration was removed: ${row.name}`)
  }

  for (const migration of migrations) {
    const applied = history.find((row) => row.name === migration.name)
    if (applied && applied.checksum !== migration.checksum) {
      throw new Error(`Applied migration was modified: ${migration.name}`)
    }
    if (!applied && history.some((row) => row.name > migration.name)) {
      throw new Error(`Migration is out of order: ${migration.name}`)
    }
  }
}
