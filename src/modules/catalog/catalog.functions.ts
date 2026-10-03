import { createServerFn } from '@tanstack/react-start'
import { itemInput } from './domain/item'
import { getCatalogRepository } from './repository.server'
import { isDemoEnabled, requireDemo } from '../../server/demo-policy'
import { getEnv } from '../../server/env.server'
import { AppError } from '../../server/errors'
import { handleRequest, requestMiddleware, validateRequest } from '../../server/request'

const listCatalogRequest = requestMiddleware('catalog.list')
const createItemRequest = requestMiddleware('catalog.create')
const createItemValidation = validateRequest(itemInput)

export const getCatalog = createServerFn({ method: 'GET' })
  .middleware([listCatalogRequest])
  .handler(async () => {
    const env = getEnv()
    if (!import.meta.env.DEV || !isDemoEnabled(env)) return { enabled: false, items: [] }
    return { enabled: true, items: await getCatalogRepository().list() }
  })

export const createItem = createServerFn({ method: 'POST' })
  .middleware([createItemRequest, createItemValidation])
  .handler(async ({ data }) =>
    handleRequest(async () => {
      if (!import.meta.env.DEV) {
        throw new AppError('forbidden', 'DEMO_DISABLED', 'Development demo is disabled')
      }
      requireDemo(getEnv())
      return getCatalogRepository().create(data)
    }),
  )
