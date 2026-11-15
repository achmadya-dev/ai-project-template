import { createServerFn } from '@tanstack/react-start'
import { handleRequest, requestMiddleware } from '../../server/request'
import { widgetInput } from './domain/widget'
import { getExampleWidgetRepository } from './repository.server'

export const createExampleWidget = createServerFn({ method: 'POST' })
  .middleware([requestMiddleware('example-widget.create')])
  .validator((input: unknown) => widgetInput.parse(input))
  .handler(({ data }) => handleRequest(() => getExampleWidgetRepository().create(data)))
