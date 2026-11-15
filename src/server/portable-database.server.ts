import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import Sqlite from 'better-sqlite3'
import { Kysely, MysqlDialect, PostgresDialect, SqliteDialect } from 'kysely'
import { createPool } from 'mysql2'
import pg from 'pg'

export type DatabaseConfig =
  | { provider: 'sqlite'; path: string }
  | { provider: 'postgres'; url: string }
  | { provider: 'mysql'; url: string }

/** Create a lazy-to-use query builder; no migrations are applied here. */
export function createPortableDatabase<Schema>(config: DatabaseConfig): Kysely<Schema> {
  switch (config.provider) {
    case 'sqlite': {
      if (config.path !== ':memory:') mkdirSync(dirname(config.path), { recursive: true })
      const database = new Sqlite(config.path)
      database.pragma('foreign_keys = ON')
      database.pragma('busy_timeout = 5000')
      return new Kysely({ dialect: new SqliteDialect({ database }) })
    }
    case 'postgres':
      return new Kysely({
        dialect: new PostgresDialect({ pool: new pg.Pool({ connectionString: config.url }) }),
      })
    case 'mysql':
      if (new URL(config.url).searchParams.has('multipleStatements')) {
        throw new Error('MySQL multipleStatements is not permitted')
      }
      return new Kysely({ dialect: new MysqlDialect({ pool: createPool(config.url) }) })
  }
}
