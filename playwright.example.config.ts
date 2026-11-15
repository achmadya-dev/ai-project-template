import { defineConfig, devices } from '@playwright/test'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

if (!process.env.EXAMPLE_TEST_DIRECTORY) {
  process.env.EXAMPLE_TEST_DIRECTORY = mkdtempSync(join(tmpdir(), 'template-example-db-'))
  process.env.EXAMPLE_TEST_OWNER = randomUUID()
  writeFileSync(
    join(process.env.EXAMPLE_TEST_DIRECTORY, '.owner'),
    process.env.EXAMPLE_TEST_OWNER,
    {
      flag: 'wx',
    },
  )
}
if (
  !process.env.EXAMPLE_TEST_OWNER ||
  readFileSync(join(process.env.EXAMPLE_TEST_DIRECTORY, '.owner'), 'utf8') !==
    process.env.EXAMPLE_TEST_OWNER
) {
  throw new Error('Example test directory ownership could not be verified')
}
process.env.EXAMPLE_SQLITE_PATH = join(process.env.EXAMPLE_TEST_DIRECTORY, 'example.sqlite')

export default defineConfig({
  testDir: './tests/example-e2e',
  workers: 1,
  reporter: 'list',
  globalTeardown: './tests/example-e2e/teardown.ts',
  use: {
    baseURL: 'http://127.0.0.1:3101',
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'bun scripts/example-server.mjs',
    url: 'http://127.0.0.1:3101/example',
    reuseExistingServer: false,
    timeout: 120000,
  },
})
