import { cp, mkdir, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { spawn } from 'node:child_process'

const sqlitePath = process.env.EXAMPLE_SQLITE_PATH
if (!sqlitePath) throw new Error('EXAMPLE_SQLITE_PATH must point to the isolated test database')
const provider = process.env.EXAMPLE_TEST_PROVIDER || 'sqlite'
const url =
  provider === 'postgres'
    ? process.env.TEST_DATABASE_URL
    : provider === 'mysql'
      ? process.env.TEST_MYSQL_URL
      : undefined
if (!['sqlite', 'postgres', 'mysql'].includes(provider))
  throw new Error('Unsupported test provider')
if (
  provider !== 'sqlite' &&
  (!url ||
    !new URL(url).pathname.endsWith('_test') ||
    !(provider === 'mysql'
      ? new URL(url).protocol === 'mysql:'
      : ['postgres:', 'postgresql:'].includes(new URL(url).protocol)))
) {
  throw new Error('A matching disposable test database ending in _test is required')
}

const root = process.cwd()
const testDirectory = process.env.EXAMPLE_TEST_DIRECTORY
if (!testDirectory) throw new Error('EXAMPLE_TEST_DIRECTORY is required')
const temporaryRoot = join(testDirectory, 'app')
await mkdir(temporaryRoot)
let child
try {
  await cp(resolve(root, 'src'), join(temporaryRoot, 'src'), { recursive: true })
  for (const file of ['tsconfig.json', 'package.json']) {
    await cp(resolve(root, file), join(temporaryRoot, file))
  }
  await cp(resolve(root, 'vite.config.ts'), join(temporaryRoot, 'vite.base.config.ts'))
  await writeFile(
    join(temporaryRoot, 'vite.config.ts'),
    `import { mergeConfig } from 'vite'
import base from './vite.base.config.ts'
export default mergeConfig(base, { server: { fs: { allow: [${JSON.stringify(root)}, ${JSON.stringify(temporaryRoot)}] } } })
`,
    { flag: 'wx' },
  )
  const dependencies = join(temporaryRoot, 'node_modules')
  await mkdir(dependencies)
  for (const entry of await readdir(resolve(root, 'node_modules'))) {
    if (['.nitro', '.vite', '.cache'].includes(entry)) continue
    await symlink(resolve(root, 'node_modules', entry), join(dependencies, entry))
  }
  await writeFile(
    join(temporaryRoot, 'src/routes/example.tsx'),
    `import { createFileRoute } from '@tanstack/react-router'
import { WidgetForm } from '../modules/example-widget/WidgetForm'
export const Route = createFileRoute('/example')({ component: WidgetForm })
`,
    { flag: 'wx' },
  )
  const env = {
    ...process.env,
    DATABASE_URL: url || '',
    DB_PROVIDER: provider,
    SQLITE_PATH: sqlitePath,
    HOST: '127.0.0.1',
    PORT: '3101',
  }
  const production = process.env.EXAMPLE_PRODUCTION === '1'
  if (production) {
    const build = spawn('bun', ['--bun', 'node_modules/vite/bin/vite.js', 'build'], {
      cwd: temporaryRoot,
      env,
      stdio: 'inherit',
    })
    const result = await new Promise((resolveExit, reject) => {
      build.once('error', reject)
      build.once('exit', resolveExit)
    })
    if (result !== 0) throw new Error('Example production build failed')
  }
  child = spawn(
    'bun',
    production
      ? ['.output/server/index.mjs']
      : ['--bun', 'node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '3101'],
    { cwd: temporaryRoot, env, stdio: 'inherit' },
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
