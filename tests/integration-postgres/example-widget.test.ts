import { afterAll, describe, expect, it } from 'vitest'
import { sql } from 'kysely'
import { createPortableDatabase } from '../../src/server/portable-database.server'
import {
  createWidgetRepository,
  type ExampleDatabase,
} from '../../src/modules/example-widget/repository.server'
import { widgetInput } from '../../src/modules/example-widget/domain/widget'

const url = process.env.TEST_DATABASE_URL
if (!url || !new URL(url).pathname.endsWith('_test')) {
  throw new Error('TEST_DATABASE_URL must target a disposable database ending in _test')
}

const db = createPortableDatabase<ExampleDatabase>({ provider: 'postgres', url })
afterAll(() => db.destroy())

describe('example widget repository', () => {
  it('creates a validated widget and maps a duplicate constraint', async () => {
    await expect(
      db.transaction().execute(async (tx) => {
        await sql`CREATE TEMP TABLE example_widgets (
          id uuid PRIMARY KEY,
          name text NOT NULL CONSTRAINT example_widgets_name_key UNIQUE
        ) ON COMMIT DROP`.execute(tx)
        const repository = createWidgetRepository(tx)
        const result = await repository.create(widgetInput.parse({ name: ' Example ' }))
        expect(result.name).toBe('Example')
        await expect(repository.create({ name: 'Example' })).rejects.toMatchObject({
          kind: 'conflict',
          code: 'EXAMPLE_WIDGET_EXISTS',
        })
      }),
    ).rejects.toThrow('Transaction was rolled back instead of committed')
  })
})
