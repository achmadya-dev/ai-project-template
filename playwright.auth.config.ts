import { defineConfig, devices } from '@playwright/test'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

if (!process.env.AUTH_TEST_DIRECTORY) {
  process.env.AUTH_TEST_DIRECTORY = mkdtempSync(join(tmpdir(), 'template-auth-db-'))
  process.env.AUTH_TEST_OWNER = randomUUID()
  writeFileSync(join(process.env.AUTH_TEST_DIRECTORY, '.owner'), process.env.AUTH_TEST_OWNER, {
    flag: 'wx',
  })
}
if (
  !process.env.AUTH_TEST_OWNER ||
  readFileSync(join(process.env.AUTH_TEST_DIRECTORY, '.owner'), 'utf8') !==
    process.env.AUTH_TEST_OWNER
) {
  throw new Error('Auth test directory ownership could not be verified')
}
process.env.AUTH_TEST_PATH = join(process.env.AUTH_TEST_DIRECTORY, 'auth.sqlite')
const provider = process.env.AUTH_TEST_PROVIDER ?? 'sqlite'
const databaseUrl =
  provider === 'postgres'
    ? process.env.TEST_DATABASE_URL
    : provider === 'mysql'
      ? process.env.TEST_MYSQL_URL
      : undefined
if (
  !['sqlite', 'postgres', 'mysql'].includes(provider) ||
  (provider !== 'sqlite' && (!databaseUrl || !new URL(databaseUrl).pathname.endsWith('_test')))
) {
  throw new Error('Auth tests require SQLite or a verified disposable database ending in _test')
}

export default defineConfig({
  testDir: './tests/auth-e2e',
  workers: 1,
  reporter: 'list',
  globalTeardown: './tests/auth-e2e/teardown.ts',
  use: {
    baseURL: 'http://127.0.0.1:3102',
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command:
      process.env.AUTH_TEST_PRODUCTION === '1'
        ? 'bun .output/server/index.mjs'
        : 'bun run dev --port 3102',
    url: 'http://127.0.0.1:3102/',
    reuseExistingServer: false,
    env: {
      DATABASE_URL: databaseUrl ?? '',
      DB_PROVIDER: provider,
      SQLITE_PATH: process.env.AUTH_TEST_PATH,
      AUTH_SECRET: 'synthetic-auth-e2e-secret-longer-than-thirty-two-characters',
      AUTH_BASE_URL: 'http://127.0.0.1:3102',
      HOST: '127.0.0.1',
      PORT: '3102',
      NODE_ENV: 'test',
    },
    timeout: 120000,
  },
})
