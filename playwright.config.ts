import { defineConfig, devices } from '@playwright/test'
import { loadEnv } from 'vite'
Object.assign(process.env, loadEnv('test', process.cwd(), ''))
const database = process.env.TEST_DATABASE_URL
if (!database || !new URL(database).pathname.endsWith('_test')) throw new Error('TEST_DATABASE_URL must end in _test')
export default defineConfig({
  testDir: './tests/e2e', fullyParallel: false, workers: 1, retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:3100', trace: 'retain-on-failure', launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'bun run dev --port 3100', url: 'http://127.0.0.1:3100', reuseExistingServer: false,
    env: { DATABASE_URL: database, DEMO_ENABLED: 'true', NODE_ENV: 'development' },
    timeout: 120000,
  },
})
