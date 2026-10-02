import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import pg from 'pg'
import { randomUUID } from 'node:crypto'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { migrate } from '../../scripts/migrate.mjs'
import { insertItem, listItems } from '../../src/modules/catalog/repository.server'
const url = process.env.TEST_DATABASE_URL
if (!url || !new URL(url).pathname.endsWith('_test')) throw new Error('TEST_DATABASE_URL must target a disposable database ending in _test')
const db = new pg.Pool({ connectionString: url })
const prefix = `T-${randomUUID().slice(0, 8).toUpperCase()}`
beforeAll(async () => { await migrate(url) })
afterAll(async () => {
  try { await db.query('DELETE FROM catalog_items WHERE sku LIKE $1', [`${prefix}%`]) }
  finally { await db.end() }
})
describe('PostgreSQL catalog', () => {
  it('persists normalized data', async () => {
    const result = await insertItem(db, { sku: `${prefix}-a`.toLowerCase(), name: ' Bolt ' })
    expect(result.ok).toBe(true)
    expect(await listItems(db)).toContainEqual(expect.objectContaining({ sku: `${prefix}-A`, name: 'Bolt' }))
  })
  it('allows exactly one concurrent insert for a SKU', async () => {
    const results = await Promise.all(Array.from({ length: 6 }, () => insertItem(db, { sku: `${prefix}-RACE`, name: 'Bolt' })))
    expect(results.filter(r => r.ok)).toHaveLength(1)
    expect(results.filter(r => !r.ok)).toHaveLength(5)
  })
  it('enforces the SKU invariant even if application validation is bypassed', async () => {
    await expect(db.query('INSERT INTO catalog_items(sku,name) VALUES($1,$2)', [`${prefix}-bad`, 'Bolt'])).rejects.toMatchObject({ code: '23514' })
  })
  it('treats SQL-looking names as data', async () => {
    const name = "'); DROP TABLE catalog_items; --"
    const result = await insertItem(db, { sku: `${prefix}-SQL`, name })
    expect(result).toMatchObject({ ok: true, item: { name } })
  })
  it('re-running migrations is idempotent', async () => { await expect(migrate(url)).resolves.toBeUndefined() })
  it('refuses rewriting applied migrations', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'migration-check-'))
    try {
      const sql = await readFile(new URL('../../db/migrations/001_catalog.sql', import.meta.url), 'utf8')
      await writeFile(join(dir, '001_catalog.sql'), `${sql}\n-- modified`)
      await expect(migrate(url, dir)).rejects.toThrow('modified')
    } finally { await rm(dir, { recursive: true }) }
  })
})
