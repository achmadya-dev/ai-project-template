import { randomUUID } from 'node:crypto'
import { copyFile, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import mysql from 'mysql2/promise'
import { expect, it } from 'vitest'
import { migrateMysql } from '../../scripts/migrate-mysql.mjs'

const url = process.env.TEST_MYSQL_URL
if (!url || !new URL(url).pathname.endsWith('_test') || new URL(url).protocol !== 'mysql:') {
  throw new Error('TEST_MYSQL_URL must target a disposable MySQL database ending in _test')
}

it('serializes migrations, detects changed history and refuses an interrupted migration', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'mysql-migrations-'))
  const suffix = randomUUID().replaceAll('-', '')
  const table = `migration_probe_${suffix}`
  const first = `010_create_probe_${suffix}.sql`
  const second = `011_bad_probe_${suffix}.sql`
  const migration = join(directory, first)
  const connection = await mysql.createConnection(url)
  try {
    await migrateMysql(url)
    const baseMigrations = join(process.cwd(), 'db/migrations/mysql')
    for (const name of await readdir(baseMigrations)) {
      if (name.endsWith('.sql')) await copyFile(join(baseMigrations, name), join(directory, name))
    }
    await writeFile(migration, `CREATE TABLE ${table} (id INTEGER PRIMARY KEY)`)
    await Promise.all([migrateMysql(url, directory), migrateMysql(url, directory)])
    await writeFile(migration, `${await readFile(migration, 'utf8')} -- changed`)
    await expect(migrateMysql(url, directory)).rejects.toThrow('modified')
    await writeFile(migration, `CREATE TABLE ${table} (id INTEGER PRIMARY KEY)`)
    await writeFile(join(directory, second), 'THIS IS NOT SQL')
    await expect(migrateMysql(url, directory)).rejects.toThrow()
    await expect(migrateMysql(url, directory)).rejects.toThrow('requires manual inspection')
  } finally {
    await connection.execute('DELETE FROM schema_migration_attempts WHERE name = ?', [second])
    await connection.execute('DELETE FROM schema_migrations WHERE name = ?', [first])
    await connection.query(`DROP TABLE IF EXISTS \`${table}\``)
    await connection.end()
    await rm(directory, { recursive: true })
  }
})

it('rejects multiple-statements connection options', async () => {
  await expect(migrateMysql(`${url}?multipleStatements=true`)).rejects.toThrow(
    'multipleStatements is not permitted',
  )
})
