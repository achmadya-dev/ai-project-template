import { expect, test } from '@playwright/test'
import pg from 'pg'

const url = process.env.TEST_DATABASE_URL
if (!url || !new URL(url).pathname.endsWith('_test')) {
  throw new Error('TEST_DATABASE_URL must target a disposable database ending in _test')
}
const pool = new pg.Pool({ connectionString: url })
let created = false

test.beforeAll(async () => {
  await pool.query(`CREATE TABLE example_widgets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL CONSTRAINT example_widgets_name_key UNIQUE
  )`)
  created = true
})

test.afterAll(async () => {
  try {
    if (created) await pool.query('DROP TABLE example_widgets')
  } finally {
    await pool.end()
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
  await pool.query('DROP TABLE example_widgets')
  created = false
  await page.getByLabel('Name').fill('Another')
  await page.getByRole('button', { name: 'Create' }).click()
  await expect(page.getByRole('status')).toHaveText('The request could not be completed.')
})
