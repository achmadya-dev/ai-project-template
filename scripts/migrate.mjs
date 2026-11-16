import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { migrate as migratePostgres } from './migrations/postgres.mjs'

export async function runMigrations(environment = process.env) {
  const provider =
    environment.DB_PROVIDER ||
    (environment.DATABASE_URL?.startsWith('mysql:')
      ? 'mysql'
      : environment.DATABASE_URL
        ? 'postgres'
        : 'sqlite')

  if (provider === 'sqlite') {
    if (environment.DATABASE_URL) throw new Error('SQLite does not use DATABASE_URL')
    const { migrateSqlite } = await import('./migrations/sqlite.mjs')
    await migrateSqlite(environment.SQLITE_PATH || '.data/app.sqlite')
  } else if (provider === 'postgres') {
    const url = environment.DATABASE_URL
    if (
      !url ||
      !['postgres:', 'postgresql:'].includes(new URL(url).protocol) ||
      new URL(url).pathname.length <= 1
    ) {
      throw new Error('PostgreSQL requires a matching DATABASE_URL')
    }
    await migratePostgres(url)
  } else if (provider === 'mysql') {
    const { migrateMysql } = await import('./migrations/mysql.mjs')
    await migrateMysql(environment.DATABASE_URL)
  } else {
    throw new Error('Unsupported DB_PROVIDER')
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  await runMigrations()
  console.log('Migrations applied successfully.')
}
