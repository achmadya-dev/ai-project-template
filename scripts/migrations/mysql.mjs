import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import { assertMigrationHistory, loadMigrations } from './shared.mjs'

const defaultDirectory = fileURLToPath(new URL('../../db/migrations/mysql/', import.meta.url))

export async function migrateMysql(url, directory = defaultDirectory) {
  if (!url || new URL(url).protocol !== 'mysql:' || new URL(url).pathname.length <= 1) {
    throw new Error('An explicit MySQL database URL is required')
  }
  if (new URL(url).searchParams.has('multipleStatements')) {
    throw new Error('MySQL multipleStatements is not permitted')
  }
  const migrations = await loadMigrations(directory)
  const connection = await mysql.createConnection(url)
  const lockName = `template_migrate_${createHash('sha256')
    .update(new URL(url).pathname)
    .digest('hex')
    .slice(0, 32)}`
  let locked = false
  try {
    const [lockRows] = await connection.execute('SELECT GET_LOCK(?, 5) AS acquired', [lockName])
    if (lockRows[0]?.acquired !== 1) throw new Error('Could not acquire MySQL migration lock')
    locked = true
    await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(255) PRIMARY KEY,
      checksum VARCHAR(64) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`)
    await connection.query(`CREATE TABLE IF NOT EXISTS schema_migration_attempts (
      name VARCHAR(255) PRIMARY KEY,
      checksum VARCHAR(64) NOT NULL
    )`)
    const [attempts] = await connection.query('SELECT name FROM schema_migration_attempts')
    if (attempts.length) {
      throw new Error('An incomplete MySQL migration requires manual inspection and recovery')
    }
    const [history] = await connection.query(
      'SELECT name, checksum FROM schema_migrations ORDER BY name',
    )
    assertMigrationHistory(migrations, history)
    for (const migration of migrations) {
      if (history.some((row) => row.name === migration.name)) continue
      await connection.execute(
        'INSERT INTO schema_migration_attempts(name, checksum) VALUES (?, ?)',
        [migration.name, migration.checksum],
      )
      await connection.query(migration.sql)
      await connection.beginTransaction()
      try {
        await connection.execute('INSERT INTO schema_migrations(name, checksum) VALUES (?, ?)', [
          migration.name,
          migration.checksum,
        ])
        await connection.execute('DELETE FROM schema_migration_attempts WHERE name = ?', [
          migration.name,
        ])
        await connection.commit()
      } catch (error) {
        await connection.rollback()
        throw error
      }
    }
  } finally {
    try {
      if (locked) await connection.execute('SELECT RELEASE_LOCK(?)', [lockName])
    } finally {
      await connection.end()
    }
  }
}
