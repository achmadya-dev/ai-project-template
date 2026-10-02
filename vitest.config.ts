import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
Object.assign(process.env, loadEnv('test', process.cwd(), ''))
export default defineConfig({ test: { fileParallelism: false, projects: [
  { test: { name: 'unit', include: ['tests/unit/**/*.test.ts'] } },
  { test: { name: 'integration', include: ['tests/integration/**/*.test.ts'], testTimeout: 15000, hookTimeout: 15000 } },
] } })
