import type { Kysely } from 'kysely'
import { AppError } from '../../server/errors'
import { getEnv } from '../../server/env.server'
import { createPortableDatabase } from '../../server/portable-database.server'
import { widgetRow, type WidgetInput } from './domain/widget'

export interface ExampleDatabase {
  example_widgets: { id: string; name: string }
}

export function createWidgetRepository(db: Kysely<ExampleDatabase>) {
  return {
    async create(input: WidgetInput) {
      const id = crypto.randomUUID()
      try {
        await db.insertInto('example_widgets').values({ id, name: input.name }).execute()
      } catch (error) {
        const code = typeof error === 'object' && error !== null ? Reflect.get(error, 'code') : null
        const constraint =
          typeof error === 'object' && error !== null ? Reflect.get(error, 'constraint') : null
        const message = error instanceof Error ? error.message : ''
        if (
          (code === '23505' && constraint === 'example_widgets_name_key') ||
          (code === 'SQLITE_CONSTRAINT_UNIQUE' &&
            message === 'UNIQUE constraint failed: example_widgets.name') ||
          (code === 'ER_DUP_ENTRY' && /(?:['.]example_widgets_name_key)'$/.test(message))
        ) {
          throw new AppError('conflict', 'EXAMPLE_WIDGET_EXISTS', 'This name is already in use', {
            cause: error,
          })
        }
        throw error
      }
      const result = await db
        .selectFrom('example_widgets')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirstOrThrow()
      const parsed = widgetRow.safeParse(result)
      if (!parsed.success) {
        throw new AppError('internal', 'DATABASE_ROW_INVALID', 'Database returned an invalid row', {
          cause: parsed.error,
          expose: false,
        })
      }
      return parsed.data
    },
  }
}

let repository: ReturnType<typeof createWidgetRepository> | undefined

export function getExampleWidgetRepository() {
  return (repository ??= createWidgetRepository(
    createPortableDatabase<ExampleDatabase>(getEnv().database),
  ))
}
