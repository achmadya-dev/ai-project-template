import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawn } from 'node:child_process'

const databaseUrl = process.env.TEST_DATABASE_URL
if (!databaseUrl || !new URL(databaseUrl).pathname.endsWith('_test')) {
  throw new Error('TEST_DATABASE_URL must target a disposable database ending in _test')
}

const root = process.cwd()
const temporaryRoot = await mkdtemp(join(tmpdir(), 'template-example-'))
let child
try {
  await cp(resolve(root, 'src'), join(temporaryRoot, 'src'), { recursive: true })
  for (const file of ['vite.config.ts', 'tsconfig.json', 'package.json']) {
    await cp(resolve(root, file), join(temporaryRoot, file))
  }
  await cp(resolve(root, 'node_modules'), join(temporaryRoot, 'node_modules'), {
    recursive: true,
    filter: (source) => !source.includes('/node_modules/.nitro/'),
  })
  await writeFile(
    join(temporaryRoot, 'src/routes/example.tsx'),
    `import { createFileRoute } from '@tanstack/react-router'
import { WidgetForm } from '../modules/example-widget/WidgetForm'
export const Route = createFileRoute('/example')({ component: WidgetForm })
`,
    { flag: 'wx' },
  )
  child = spawn(
    'bun',
    ['--bun', 'node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '3101'],
    {
      cwd: temporaryRoot,
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'inherit',
    },
  )
  const stop = () => child.kill('SIGTERM')
  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)
  const result = await new Promise((resolveExit, reject) => {
    child.once('error', reject)
    child.once('exit', (code) => resolveExit(code))
  })
  process.exitCode = typeof result === 'number' ? result : 1
} finally {
  await rm(temporaryRoot, { recursive: true, force: true })
}
