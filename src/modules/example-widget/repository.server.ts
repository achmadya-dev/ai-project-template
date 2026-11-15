import type { DatabaseClient } from '../../server/database.server'
import { widgetRow, type WidgetInput } from './domain/widget'

export function createWidgetRepository(db: DatabaseClient) {
  return {
    create(input: WidgetInput) {
      return db.one(widgetRow, {
        text: 'INSERT INTO example_widgets (name) VALUES ($1) RETURNING id, name',
        values: [input.name],
        constraints: {
          example_widgets_name_key: {
            kind: 'conflict',
            code: 'EXAMPLE_WIDGET_EXISTS',
            message: 'This name is already in use',
          },
        },
      })
    },
  }
}
