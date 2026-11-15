import { expect, test } from '@playwright/test'
import {
  createPortableDatabase,
  type DatabaseConfig,
} from '../../src/server/portable-database.server'
import type { ExampleDatabase } from '../../src/modules/example-widget/repository.server'

const path = process.env.EXAMPLE_SQLITE_PATH
if (!path) throw new Error('EXAMPLE_SQLITE_PATH is required')
const provider = process.env.EXAMPLE_TEST_PROVIDER || 'sqlite'
const url = provider === 'postgres' ? process.env.TEST_DATABASE_URL : process.env.TEST_MYSQL_URL
let config: DatabaseConfig
if (provider === 'sqlite') config = { provider, path }
else if (
  (provider === 'postgres' || provider === 'mysql') &&
  url &&
  new URL(url).pathname.endsWith('_test') &&
  (provider === 'postgres'
    ? ['postgres:', 'postgresql:'].includes(new URL(url).protocol)
    : new URL(url).protocol === 'mysql:')
) {
  config = { provider, url }
} else throw new Error('A matching disposable test database ending in _test is required')
const db = createPortableDatabase<ExampleDatabase>(config)
let created = false

test.beforeAll(async () => {
  await db.schema
    .createTable('example_widgets')
    .addColumn('id', 'varchar(36)', (column) => column.primaryKey())
    .addColumn('name', 'varchar(80)', (column) => column.notNull())
    .addUniqueConstraint('example_widgets_name_key', ['name'])
    .execute()
  created = true
})

test.afterAll(async () => {
  try {
    if (created) await db.schema.dropTable('example_widgets').execute()
  } finally {
    await db.destroy()
  }
})

test('validates input and creates a widget through the server boundary', async ({ page }) => {
  page.on('pageerror', (error) => console.error(error))
  page.on('console', (message) => {
    if (message.type() === 'error') console.error(message.text())
  })
  await page.goto('/example')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Create' }).click()
  await expect(page.getByRole('status')).toHaveText('Enter a name between 1 and 80 characters.')
  await page.getByLabel('Name').fill('Example')
  await page.getByRole('button', { name: 'Create' }).click()
  await expect(page.getByRole('status')).toHaveText('Created Example.')
  await page.getByLabel('Name').fill('Example')
  await page.getByRole('button', { name: 'Create' }).click()
  await expect(page.getByRole('status')).toHaveText('This name is already in use.')
  await db.schema.dropTable('example_widgets').execute()
  created = false
  await page.getByLabel('Name').fill('Another')
  await page.getByRole('button', { name: 'Create' }).click()
  await expect(page.getByRole('status')).toHaveText('The request could not be completed.')
})
