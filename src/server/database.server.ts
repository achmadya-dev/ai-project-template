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

function readPgError(error: unknown): { code?: string; constraint?: string } {
  if (typeof error !== 'object' || error === null) return {}
  const candidate = error as Record<string, unknown>

  return {
    code: typeof candidate.code === 'string' ? candidate.code : undefined,
    constraint: typeof candidate.constraint === 'string' ? candidate.constraint : undefined,
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
    return new AppError('conflict', 'DATABASE_REFERENCE_CONFLICT', 'Referenced resource is in use', {
      cause: error,
    })
  }

  if (code === '23502') {
    return new AppError('invalid_argument', 'DATABASE_REQUIRED_VALUE', 'Required value is missing', {
      cause: error,
    })
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

async function queryRows(
  queryable: Queryable,
  query: SqlQuery,
): Promise<pg.QueryResultRow[]> {
  try {
    const result = await queryable.query<pg.QueryResultRow>(query.text, query.values ?? [])
    return result.rows
  } catch (error) {
    throw translatePostgresError(error, query)
  }
}

async function executeQuery(queryable: Queryable, query: SqlQuery): Promise<number> {
  try {
    const result = await queryable.query(query.text, query.values ?? [])
    return result.rowCount ?? 0
  } catch (error) {
    throw translatePostgresError(error, query)
  }
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
        await connection.query('ROLLBACK').catch(() => undefined)
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
