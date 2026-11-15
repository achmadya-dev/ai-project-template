import { createServerFn } from '@tanstack/react-start'
import { getDb } from '../../server/db.server'
import { handleRequest, requestMiddleware } from '../../server/request'
import { widgetInput } from './domain/widget'
import { createWidgetRepository } from './repository.server'

export const createExampleWidget = createServerFn({ method: 'POST' })
  .middleware([requestMiddleware('example-widget.create')])
  .validator((input: unknown) => widgetInput.parse(input))
  .handler(({ data }) => handleRequest(() => createWidgetRepository(getDb()).create(data)))
