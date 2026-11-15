import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import Sqlite from 'better-sqlite3'
import { migrateSqlite } from '../../scripts/migrate-sqlite.mjs'

it('applies SQLite migrations atomically and detects changed history', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'sqlite-migrations-'))
  const database = join(directory, 'test.sqlite')
  const migration = join(directory, '001_create_probe.sql')
  try {
    await writeFile(migration, 'CREATE TABLE probe (id INTEGER PRIMARY KEY);')
    await Promise.all([migrateSqlite(database, directory), migrateSqlite(database, directory)])
    await writeFile(migration, `${await readFile(migration, 'utf8')}\n-- changed`)
    await expect(migrateSqlite(database, directory)).rejects.toThrow('modified')
    await writeFile(migration, 'CREATE TABLE probe (id INTEGER PRIMARY KEY);')
    await rm(migration)
    await expect(migrateSqlite(database, directory)).rejects.toThrow('removed')
    await writeFile(migration, 'CREATE TABLE probe (id INTEGER PRIMARY KEY);')
    await writeFile(
      join(directory, '002_fail.sql'),
      'CREATE TABLE rollback_probe (id INTEGER); SELECT * FROM nonexistent_table;',
    )
    await expect(migrateSqlite(database, directory)).rejects.toThrow()
    const db = new Sqlite(database, { readonly: true })
    try {
      expect(
        db.prepare("SELECT name FROM sqlite_master WHERE name = 'rollback_probe'").get(),
      ).toBeUndefined()
    } finally {
      db.close()
    }
  } finally {
    await rm(directory, { recursive: true })
  }
})
