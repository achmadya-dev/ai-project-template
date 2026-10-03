import { readdir, readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import pg from 'pg'

export async function migrate(
  connectionString,
  directory = fileURLToPath(new URL('../db/migrations/', import.meta.url)),
) {
  if (!connectionString) throw new Error('DATABASE_URL is required; no default target is selected')
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
    const files = (await readdir(directory)).filter((n) => /^\d+_[a-z0-9_]+\.sql$/.test(n)).sort()
    const history = await client.query('SELECT name, checksum FROM schema_migrations ORDER BY name')
    for (const row of history.rows) {
      if (!files.includes(row.name)) throw new Error(`Applied migration was removed: ${row.name}`)
    }
    for (const name of files) {
      const sql = await readFile(path.join(directory, name), 'utf8')
      const checksum = createHash('sha256').update(sql).digest('hex')
      const applied = history.rows.find((row) => row.name === name)
      if (applied) {
        if (applied.checksum !== checksum)
          throw new Error(`Applied migration was modified: ${name}`)
        continue
      }
      if (history.rows.some((row) => row.name > name))
        throw new Error(`Migration is out of order: ${name}`)
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations(name, checksum) VALUES ($1, $2)', [
        name,
        checksum,
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
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  await migrate(process.env.DATABASE_URL)
  console.log('Migrations applied successfully.')
}
