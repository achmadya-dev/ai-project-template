import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createPortableDatabase } from '../../src/server/portable-database.server'
import {
  createWidgetRepository,
  type ExampleDatabase,
} from '../../src/modules/example-widget/repository.server'

const url = process.env.TEST_MYSQL_URL
if (!url || !new URL(url).pathname.endsWith('_test') || new URL(url).protocol !== 'mysql:') {
  throw new Error('TEST_MYSQL_URL must target a disposable MySQL database ending in _test')
}

const db = createPortableDatabase<ExampleDatabase>({ provider: 'mysql', url })
let created = false
beforeAll(async () => {
  await db.schema
    .createTable('example_widgets')
    .addColumn('id', 'varchar(36)', (column) => column.primaryKey())
    .addColumn('name', 'varchar(80)', (column) => column.notNull())
    .addUniqueConstraint('example_widgets_name_key', ['name'])
    .execute()
  created = true
})
afterAll(async () => {
  try {
    if (created) await db.schema.dropTable('example_widgets').execute()
  } finally {
    await db.destroy()
  }
})

describe('MySQL portable repository', () => {
  it('creates a widget and maps a duplicate to a stable error', async () => {
    const repository = createWidgetRepository(db)
    await expect(repository.create({ name: 'Example' })).resolves.toMatchObject({ name: 'Example' })
    await expect(repository.create({ name: 'Example' })).rejects.toMatchObject({
      kind: 'conflict',
      code: 'EXAMPLE_WIDGET_EXISTS',
    })
  })

  it('rolls back a failed transaction', async () => {
    await expect(
      db.transaction().execute(async (transaction) => {
        await createWidgetRepository(transaction).create({ name: 'Rollback' })
        throw new Error('abort')
      }),
    ).rejects.toThrow('abort')
    expect(
      await db.selectFrom('example_widgets').select('id').where('name', '=', 'Rollback').execute(),
    ).toEqual([])
  })
})
