import { expect, test } from '@playwright/test'

test('renders the template home without a sample business feature', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Alur kerja' })).toBeVisible()
  await expect(page.getByText('01 / Rencanakan')).toBeVisible()
  await expect(page.getByText('02 / Kerjakan')).toBeVisible()
  await expect(page.getByText('03 / Verifikasi')).toBeVisible()
  await expect(page.getByText('Katalog barang', { exact: true })).toHaveCount(0)
  await expect(page.getByLabel('SKU')).toHaveCount(0)
  await expect(page.locator('form')).toHaveCount(0)
  expect(errors).toEqual([])

  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true })
})
