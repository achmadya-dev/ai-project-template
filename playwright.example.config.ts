import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/example-e2e',
  workers: 1,
  reporter: 'list',
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
