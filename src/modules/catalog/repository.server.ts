import type { Pool } from 'pg'
import { itemInput, type CreateItemResult, type Item } from './domain/item'
export async function listItems(db: Pool): Promise<Item[]> {
  const result = await db.query<Item>('SELECT id, sku, name FROM catalog_items ORDER BY created_at DESC, id DESC LIMIT 100')
  return result.rows
}
export async function insertItem(db: Pool, input: unknown): Promise<CreateItemResult> {
  const data = itemInput.parse(input)
  try {
    const result = await db.query<Item>('INSERT INTO catalog_items (sku, name) VALUES ($1, $2) RETURNING id, sku, name', [data.sku, data.name])
    const item = result.rows[0]
    if (!item) throw new Error('Insert did not return an item')
    return { ok: true, item }
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505' && 'constraint' in error && error.constraint === 'catalog_items_sku_key') {
      return { ok: false, code: 'DUPLICATE_SKU' }
    }
    throw error
  }
}
