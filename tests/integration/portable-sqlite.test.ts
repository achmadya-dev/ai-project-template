import { afterAll, describe, expect, it } from 'vitest'
import { createPortableDatabase } from '../../src/server/portable-database.server'
import {
  createWidgetRepository,
  type ExampleDatabase,
} from '../../src/modules/example-widget/repository.server'

interface Schema {
  examples: { id: string; name: string }
}

const db = createPortableDatabase<Schema>({ provider: 'sqlite', path: ':memory:' })
afterAll(() => db.destroy())

describe('portable SQLite adapter', () => {
  it('runs parameterized queries, enforces constraints and rolls back transactions', async () => {
    await db.schema
      .createTable('examples')
      .addColumn('id', 'varchar(36)', (column) => column.primaryKey())
      .addColumn('name', 'varchar(80)', (column) => column.notNull().unique())
      .execute()
    const value = "'; DROP TABLE examples; --"
    await db.insertInto('examples').values({ id: '1', name: value }).execute()
    expect(await db.selectFrom('examples').selectAll().execute()).toEqual([
      { id: '1', name: value },
    ])
    await expect(
      db.insertInto('examples').values({ id: '2', name: value }).execute(),
    ).rejects.toThrow()
    await expect(
      db.transaction().execute(async (transaction) => {
        await transaction.insertInto('examples').values({ id: '3', name: 'rollback' }).execute()
        throw new Error('abort')
      }),
    ).rejects.toThrow('abort')
    expect(await db.selectFrom('examples').selectAll().execute()).toHaveLength(1)
  })
})

describe('SQLite example repository', () => {
  it('creates a widget and maps a duplicate to a stable error', async () => {
    const example = createPortableDatabase<ExampleDatabase>({
      provider: 'sqlite',
      path: ':memory:',
    })
    try {
      await example.schema
        .createTable('example_widgets')
        .addColumn('id', 'varchar(36)', (column) => column.primaryKey())
        .addColumn('name', 'varchar(80)', (column) => column.notNull().unique())
        .execute()
      const repository = createWidgetRepository(example)
      await expect(repository.create({ name: 'Example' })).resolves.toMatchObject({
        name: 'Example',
      })
      await expect(repository.create({ name: 'Example' })).rejects.toMatchObject({
        kind: 'conflict',
        code: 'EXAMPLE_WIDGET_EXISTS',
      })
    } finally {
      await example.destroy()
    }
  })
})
