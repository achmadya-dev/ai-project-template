import pg from 'pg'
import { z } from 'zod'
import { AppError, appError, type AppErrorSpec } from './errors.server'

export type SqlQuery = {
  text: string
  values?: unknown[]
  constraints?: Record<string, AppErrorSpec>
}

export interface DatabaseClient {
  many<T>(schema: z.ZodType<T>, query: SqlQuery): Promise<T[]>
  one<T>(schema: z.ZodType<T>, query: SqlQuery): Promise<T>
  maybeOne<T>(schema: z.ZodType<T>, query: SqlQuery): Promise<T | null>
  execute(query: SqlQuery): Promise<number>
}

export interface Database extends DatabaseClient {
  transaction<T>(work: (db: DatabaseClient) => Promise<T>): Promise<T>
  close(): Promise<void>
}

type Queryable = pg.Pool | pg.PoolClient

function readStringProperty(error: object, property: 'code' | 'constraint'): string | undefined {
  const value = Reflect.get(error, property)
  return typeof value === 'string' ? value : undefined
}

function readPgError(error: unknown): { code?: string; constraint?: string } {
  if (typeof error !== 'object' || error === null) return {}

  return {
    code: readStringProperty(error, 'code'),
    constraint: readStringProperty(error, 'constraint'),
  }
}

function translatePostgresError(error: unknown, query: SqlQuery): unknown {
  const { code, constraint } = readPgError(error)
  const mapped = constraint ? query.constraints?.[constraint] : undefined

  if (mapped) return appError(mapped, { cause: error })

  if (code === '23505') {
    return new AppError('conflict', 'DATABASE_CONFLICT', 'Resource already exists', {
      cause: error,
    })
  }

  if (code === '23503') {
    return new AppError(
      'conflict',
      'DATABASE_REFERENCE_CONFLICT',
      'Referenced resource is in use',
      {
        cause: error,
      },
    )
  }

  if (code === '23502') {
    return new AppError(
      'invalid_argument',
      'DATABASE_REQUIRED_VALUE',
      'Required value is missing',
      {
        cause: error,
      },
    )
  }

  if (code === '23514') {
    return new AppError(
      'invalid_argument',
      'DATABASE_CHECK_VIOLATION',
      'Database constraint rejected the request',
      { cause: error },
    )
  }

  return error
}

async function runQuery<T extends pg.QueryResultRow = pg.QueryResultRow>(
  queryable: Queryable,
  query: SqlQuery,
): Promise<pg.QueryResult<T>> {
  try {
    return await queryable.query<T>(query.text, query.values ?? [])
  } catch (error) {
    throw translatePostgresError(error, query)
  }
}

async function queryRows(queryable: Queryable, query: SqlQuery): Promise<pg.QueryResultRow[]> {
  return (await runQuery(queryable, query)).rows
}

async function executeQuery(queryable: Queryable, query: SqlQuery): Promise<number> {
  return (await runQuery(queryable, query)).rowCount ?? 0
}

function parseRow<T>(schema: z.ZodType<T>, row: pg.QueryResultRow): T {
  const parsed = schema.safeParse(row)
  if (parsed.success) return parsed.data

  throw new AppError('internal', 'DATABASE_ROW_INVALID', 'Database returned an invalid row', {
    cause: parsed.error,
    expose: false,
  })
}

function createClient(queryable: Queryable): DatabaseClient {
  return {
    async many(schema, query) {
      const rows = await queryRows(queryable, query)
      return rows.map((row) => parseRow(schema, row))
    },

    async one(schema, query) {
      const rows = await queryRows(queryable, query)
      if (rows.length !== 1) {
        throw new AppError(
          'internal',
          'DATABASE_EXPECTED_ONE_ROW',
          'Database query did not return exactly one row',
          { expose: false },
        )
      }
      return parseRow(schema, rows[0]!)
    },

    async maybeOne(schema, query) {
      const rows = await queryRows(queryable, query)
      if (rows.length === 0) return null
      if (rows.length > 1) {
        throw new AppError(
          'internal',
          'DATABASE_EXPECTED_AT_MOST_ONE_ROW',
          'Database query returned more than one row',
          { expose: false },
        )
      }
      return parseRow(schema, rows[0]!)
    },

    execute(query) {
      return executeQuery(queryable, query)
    },
  }
}

export function createPostgresDatabase(config: pg.PoolConfig): Database {
  const pool = new pg.Pool(config)
  const client = createClient(pool)

  return {
    ...client,

    async transaction(work) {
      const connection = await pool.connect()
      try {
        await connection.query('BEGIN')
        const result = await work(createClient(connection))
        await connection.query('COMMIT')
        return result
      } catch (error) {
        try {
          await connection.query('ROLLBACK')
        } catch (rollbackError) {
          throw new AppError('internal', 'DATABASE_ROLLBACK_FAILED', 'Database rollback failed', {
            cause: new AggregateError([error, rollbackError]),
            expose: false,
          })
        }
        throw error
      } finally {
        connection.release()
      }
    },

    close() {
      return pool.end()
    },
  }
}
