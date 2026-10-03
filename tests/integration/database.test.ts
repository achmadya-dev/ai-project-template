import { randomUUID } from 'node:crypto'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { migrate } from '../../scripts/migrate.mjs'
import { createPostgresDatabase } from '../../src/server/database.server'

const url = process.env.TEST_DATABASE_URL
if (!url || !new URL(url).pathname.endsWith('_test')) {
  throw new Error('TEST_DATABASE_URL must target a disposable database ending in _test')
}

const db = createPostgresDatabase({ connectionString: url })
const tableName = `integration_${randomUUID().replaceAll('-', '')}`
const table = `"${tableName}"`
const numberRow = z.object({ value: z.number() })
const recordRow = z.object({ id: z.string().uuid(), value: z.string(), positive: z.number() })

beforeAll(async () => {
  await migrate(url)
  await db.execute({
    text: `CREATE TABLE ${table} (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      value text NOT NULL UNIQUE,
      positive integer NOT NULL CHECK (positive > 0)
    )`,
  })
})

afterAll(async () => {
  try {
    await db.execute({ text: `DROP TABLE IF EXISTS ${table}` })
  } finally {
    await db.close()
  }
})

describe('PostgreSQL database adapter', () => {
  it('validates rows and enforces one/maybeOne cardinality', async () => {
    await expect(
      db.many(numberRow, {
        text: 'SELECT value FROM (VALUES (1::integer), (2::integer)) AS numbers(value)',
      }),
    ).resolves.toEqual([{ value: 1 }, { value: 2 }])
    await expect(db.one(numberRow, { text: 'SELECT 1::integer AS value' })).resolves.toEqual({
      value: 1,
    })
    await expect(
      db.maybeOne(numberRow, { text: 'SELECT 1::integer AS value WHERE FALSE' }),
    ).resolves.toBeNull()

    await expect(
      db.one(numberRow, { text: 'SELECT 1::integer AS value WHERE FALSE' }),
    ).rejects.toMatchObject({ kind: 'internal', code: 'DATABASE_EXPECTED_ONE_ROW' })
    await expect(
      db.maybeOne(numberRow, {
        text: 'SELECT value FROM (VALUES (1::integer), (2::integer)) AS numbers(value)',
      }),
    ).rejects.toMatchObject({ kind: 'internal', code: 'DATABASE_EXPECTED_AT_MOST_ONE_ROW' })
    await expect(
      db.one(z.object({ id: z.string().uuid() }), { text: `SELECT 'not-a-uuid' AS id` }),
    ).rejects.toMatchObject({ kind: 'internal', code: 'DATABASE_ROW_INVALID' })
  })

  it('returns the affected row count from execute', async () => {
    await expect(db.execute({ text: 'SELECT 1' })).resolves.toBe(1)
  })

  it('commits and rolls back transactions', async () => {
    const value = `commit-${randomUUID()}`
    const committed = await db.transaction((transaction) =>
      transaction.one(recordRow, {
        text: `INSERT INTO ${table} (value, positive) VALUES ($1, $2) RETURNING id, value, positive`,
        values: [value, 1],
      }),
    )
    await expect(
      db.maybeOne(recordRow, {
        text: `SELECT id, value, positive FROM ${table} WHERE id = $1`,
        values: [committed.id],
      }),
    ).resolves.toEqual(committed)

    const rolledBackValue = `rollback-${randomUUID()}`
    await expect(
      db.transaction(async (transaction) => {
        await transaction.execute({
          text: `INSERT INTO ${table} (value, positive) VALUES ($1, $2)`,
          values: [rolledBackValue, 1],
        })
        throw new Error('abort transaction')
      }),
    ).rejects.toThrow('abort transaction')
    await expect(
      db.maybeOne(recordRow, {
        text: `SELECT id, value, positive FROM ${table} WHERE value = $1`,
        values: [rolledBackValue],
      }),
    ).resolves.toBeNull()
  })

  it('normalizes constraint errors and parameterizes SQL-looking data', async () => {
    const value = "'); DROP TABLE schema_migrations; --"
    await expect(
      db.one(recordRow, {
        text: `INSERT INTO ${table} (value, positive) VALUES ($1, $2) RETURNING id, value, positive`,
        values: [value, 1],
      }),
    ).resolves.toMatchObject({ value })

    await expect(
      db.execute({
        text: `INSERT INTO ${table} (value, positive) VALUES ($1, $2)`,
        values: [`check-${randomUUID()}`, 0],
      }),
    ).rejects.toMatchObject({ kind: 'invalid_argument', code: 'DATABASE_CHECK_VIOLATION' })

    await expect(
      db.execute({
        text: `INSERT INTO ${table} (value, positive) VALUES ($1, $2)`,
        values: [value, 1],
      }),
    ).rejects.toMatchObject({ kind: 'conflict', code: 'DATABASE_CONFLICT' })
  })

  it('keeps migrations idempotent and refuses rewriting an applied migration', async () => {
    await expect(migrate(url)).resolves.toBeUndefined()

    const dir = await mkdtemp(join(tmpdir(), 'migration-check-'))
    try {
      const sql = await readFile(
        new URL('../../db/migrations/001_catalog.sql', import.meta.url),
        'utf8',
      )
      await writeFile(join(dir, '001_catalog.sql'), `${sql}\n-- modified`)
      await expect(migrate(url, dir)).rejects.toThrow('modified')
    } finally {
      await rm(dir, { recursive: true })
    }
  })
})
