import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { assertMigrationHistory, loadMigrations } from './shared.mjs'

const defaultDirectory = fileURLToPath(new URL('../../db/migrations/postgres/', import.meta.url))

export async function migrate(connectionString, directory = defaultDirectory) {
  if (!connectionString) throw new Error('DATABASE_URL is required; no default target is selected')
  const migrations = await loadMigrations(directory)
  const client = new pg.Client({
    connectionString,
    connectionTimeoutMillis: 5000,
    statement_timeout: 30000,
  })
  await client.connect()
  try {
    await client.query('BEGIN')
    await client.query("SET LOCAL lock_timeout = '5s'")
    await client.query('SELECT pg_advisory_xact_lock(714202610)')
    await client.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())',
    )
    const result = await client.query('SELECT name, checksum FROM schema_migrations ORDER BY name')
    const history = result.rows
    assertMigrationHistory(migrations, history)
    for (const migration of migrations) {
      if (history.some((row) => row.name === migration.name)) continue
      await client.query(migration.sql)
      await client.query('INSERT INTO schema_migrations(name, checksum) VALUES ($1, $2)', [
        migration.name,
        migration.checksum,
      ])
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    await client.end()
  }
}
