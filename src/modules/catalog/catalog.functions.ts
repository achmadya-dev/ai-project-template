import { createServerFn } from '@tanstack/react-start'
import { itemInput } from './domain/item'
import { getDb } from '../../server/db.server'
import { isDemoEnabled, requireDemo } from '../../server/demo-policy'
import { insertItem, listItems } from './repository.server'

export const getCatalog = createServerFn({ method: 'GET' }).handler(async () => {
  if (!import.meta.env.DEV || !isDemoEnabled(process.env)) return { enabled: false, items: [] }
  return { enabled: true, items: await listItems(getDb()) }
})
export const createItem = createServerFn({ method: 'POST' })
  .validator(itemInput)
  .handler(async ({ data }) => {
    if (!import.meta.env.DEV) throw new Error('Development demo is disabled')
    requireDemo(process.env)
    return insertItem(getDb(), data)
  })
