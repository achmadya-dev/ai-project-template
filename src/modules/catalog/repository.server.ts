import type { DatabaseClient } from '../../server/database.server'
import { getDb } from '../../server/db.server'
import { itemRow, type Item, type ItemInput } from './domain/item'

export interface CatalogRepository {
  list(): Promise<Item[]>
  create(input: ItemInput): Promise<Item>
}

export function createCatalogRepository(db: DatabaseClient): CatalogRepository {
  return {
    list() {
      return db.many(itemRow, {
        text: `
          SELECT id, sku, name
          FROM catalog_items
          ORDER BY created_at DESC, id DESC
          LIMIT 100
        `,
      })
    },

    create(input) {
      return db.one(itemRow, {
        text: `
          INSERT INTO catalog_items (sku, name)
          VALUES ($1, $2)
          RETURNING id, sku, name
        `,
        values: [input.sku, input.name],
        constraints: {
          catalog_items_sku_key: {
            kind: 'conflict',
            code: 'DUPLICATE_SKU',
            message: 'SKU already exists',
          },
        },
      })
    },
  }
}

let repository: CatalogRepository | undefined

export function getCatalogRepository(): CatalogRepository {
  return (repository ??= createCatalogRepository(getDb()))
}
