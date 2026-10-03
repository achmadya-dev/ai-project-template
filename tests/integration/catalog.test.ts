import { randomUUID } from 'node:crypto'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { migrate } from '../../scripts/migrate.mjs'
import { itemInput, itemRow } from '../../src/modules/catalog/domain/item'
import { createCatalogRepository } from '../../src/modules/catalog/repository.server'
import { createPostgresDatabase } from '../../src/server/database.server'

const url = process.env.TEST_DATABASE_URL
if (!url || !new URL(url).pathname.endsWith('_test')) {
  throw new Error('TEST_DATABASE_URL must target a disposable database ending in _test')
}

const db = createPostgresDatabase({ connectionString: url })
const repository = createCatalogRepository(db)
const prefix = `T-${randomUUID().slice(0, 8).toUpperCase()}`
const createItem = (input: unknown) => repository.create(itemInput.parse(input))
const numberRow = z.object({ value: z.number() })

beforeAll(async () => {
  await migrate(url)
})

afterAll(async () => {
  try {
    await db.execute({
      text: 'DELETE FROM catalog_items WHERE sku LIKE $1',
      values: [`${prefix}%`],
    })
  } finally {
    await db.close()
  }
})

describe('PostgreSQL catalog', () => {
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
      db.one(itemRow, {
        text: `SELECT 'not-a-uuid' AS id, 'SKU-1' AS sku, 'Bolt' AS name`,
      }),
    ).rejects.toMatchObject({ kind: 'internal', code: 'DATABASE_ROW_INVALID' })
  })

  it('returns the affected row count from execute', async () => {
    const sku = `${prefix}-EXECUTE`
    await createItem({ sku, name: 'Bolt' })

    await expect(
      db.execute({ text: 'DELETE FROM catalog_items WHERE sku = $1', values: [sku] }),
    ).resolves.toBe(1)
  })

  it('commits successful transactions and rolls back failed callbacks', async () => {
    const committedSku = `${prefix}-COMMIT`
    const committed = await db.transaction((transaction) =>
      transaction.one(itemRow, {
        text: `
          INSERT INTO catalog_items (sku, name)
          VALUES ($1, $2)
          RETURNING id, sku, name
        `,
        values: [committedSku, 'Committed'],
      }),
    )
    await expect(
      db.maybeOne(itemRow, {
        text: 'SELECT id, sku, name FROM catalog_items WHERE id = $1',
        values: [committed.id],
      }),
    ).resolves.toEqual(committed)

    const rolledBackSku = `${prefix}-ROLLBACK`
    await expect(
      db.transaction(async (transaction) => {
        await transaction.execute({
          text: 'INSERT INTO catalog_items (sku, name) VALUES ($1, $2)',
          values: [rolledBackSku, 'Rolled back'],
        })
        throw new Error('abort transaction')
      }),
    ).rejects.toThrow('abort transaction')
    await expect(
      db.maybeOne(itemRow, {
        text: 'SELECT id, sku, name FROM catalog_items WHERE sku = $1',
        values: [rolledBackSku],
      }),
    ).resolves.toBeNull()
  })

  it('persists normalized data', async () => {
    await expect(
      createItem({ sku: `${prefix}-a`.toLowerCase(), name: ' Bolt ' }),
    ).resolves.toMatchObject({ sku: `${prefix}-A`, name: 'Bolt' })
    expect(await repository.list()).toContainEqual(
      expect.objectContaining({ sku: `${prefix}-A`, name: 'Bolt' }),
    )
  })

  it('allows exactly one concurrent insert for a SKU', async () => {
    const results = await Promise.allSettled(
      Array.from({ length: 6 }, () => createItem({ sku: `${prefix}-RACE`, name: 'Bolt' })),
    )
    const fulfilled = results.filter((result) => result.status === 'fulfilled')
    const rejected = results.filter((result) => result.status === 'rejected')

    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(5)
    for (const result of rejected) {
      expect(result.reason).toMatchObject({ kind: 'conflict', code: 'DUPLICATE_SKU' })
    }
  })

  it('normalizes known PostgreSQL check failures without repository try/catch', async () => {
    await expect(
      db.execute({
        text: 'INSERT INTO catalog_items(sku,name) VALUES($1,$2)',
        values: [`${prefix}-bad`, 'Bolt'],
      }),
    ).rejects.toMatchObject({
      kind: 'invalid_argument',
      code: 'DATABASE_CHECK_VIOLATION',
    })
  })

  it('treats SQL-looking names as data', async () => {
    const name = "'); DROP TABLE catalog_items; --"
    await expect(createItem({ sku: `${prefix}-SQL`, name })).resolves.toMatchObject({ name })
  })

  it('re-running migrations is idempotent', async () => {
    await expect(migrate(url)).resolves.toBeUndefined()
  })

  it('refuses rewriting applied migrations', async () => {
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
