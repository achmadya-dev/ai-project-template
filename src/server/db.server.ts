import { createPostgresDatabase, type Database } from './database.server'
import { getEnv } from './env.server'
import { AppError } from './errors.server'

let database: Database | undefined

export function getDb(): Database {
  if (database) return database

  const { databaseUrl } = getEnv()
  if (!databaseUrl) {
    throw new AppError('internal', 'DATABASE_NOT_CONFIGURED', 'Database is not configured', {
      expose: false,
    })
  }

  database = createPostgresDatabase({
    connectionString: databaseUrl,
    max: 5,
    connectionTimeoutMillis: 5000,
    statement_timeout: 10000,
  })

  return database
}
