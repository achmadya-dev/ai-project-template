import { randomUUID } from 'node:crypto'
import { expect, test } from '@playwright/test'
import { createPostgresDatabase } from '../../src/server/database.server'

const testDatabaseUrl = process.env.TEST_DATABASE_URL
if (!testDatabaseUrl || !new URL(testDatabaseUrl).pathname.endsWith('_test')) {
  throw new Error('TEST_DATABASE_URL must target a disposable database ending in _test')
}

test('create, reload, reject duplicate SKU', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const sku = `E2E-${randomUUID().slice(0, 8).toUpperCase()}`

  try {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Katalog barang' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Tambah barang' })).toBeEnabled()
    await page.locator('form').evaluate((form) => form.setAttribute('novalidate', ''))
    await page.getByLabel('SKU', { exact: true }).fill('INVALID SKU')
    await page.getByLabel('Nama barang').fill('Komponen uji')
    await page.getByRole('button', { name: 'Tambah barang' }).click()
    await expect(page.getByRole('status')).toContainText('Gagal menyimpan')

    await page.getByLabel('SKU', { exact: true }).fill(sku)
    await page.getByLabel('Nama barang').fill('Komponen uji')
    await page.getByRole('button', { name: 'Tambah barang' }).click()
    await expect(page.getByRole('status')).toContainText('berhasil')
    await page.reload()
    await expect(page.getByText(sku, { exact: true })).toBeVisible()
    await page.getByLabel('SKU', { exact: true }).fill(sku.toLowerCase())
    await page.getByLabel('Nama barang').fill('Duplikat')
    await page.getByRole('button', { name: 'Tambah barang' }).click()
    await expect(page.getByRole('status')).toContainText('SKU sudah digunakan')
    await expect(page.getByText(sku, { exact: true })).toHaveCount(1)
    expect(new URL(page.url()).search).toBe('')
    expect(errors).toEqual([])
    await page.screenshot({ path: 'test-results/catalog-desktop.png', fullPage: true })
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.getByRole('button', { name: 'Tambah barang' })).toBeVisible()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
    await page.screenshot({ path: 'test-results/catalog-mobile.png', fullPage: true })
  } finally {
    const db = createPostgresDatabase({ connectionString: testDatabaseUrl })
    try {
      await db.execute({ text: 'DELETE FROM catalog_items WHERE sku = $1', values: [sku] })
    } finally {
      await db.close()
    }
  }
})
