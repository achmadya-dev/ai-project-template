import { expect, test } from '@playwright/test'
import { migrateSqlite } from '../../scripts/migrations/sqlite.mjs'
import { migrateMysql } from '../../scripts/migrations/mysql.mjs'
import { migrate } from '../../scripts/migrations/postgres.mjs'
import { createAuth } from '../../src/modules/auth/auth.server'
import { bootstrapFirstAdmin } from '../../src/modules/auth/bootstrap.server'
import type { DatabaseConfig } from '../../src/server/portable-database.server'

const path = process.env.AUTH_TEST_PATH
if (!path) throw new Error('AUTH_TEST_PATH is required')
const secret = 'synthetic-auth-e2e-secret-longer-than-thirty-two-characters'
const origin = 'http://127.0.0.1:3102'
const password = 'synthetic-password-123'
const provider = process.env.AUTH_TEST_PROVIDER ?? 'sqlite'
const url = provider === 'postgres' ? process.env.TEST_DATABASE_URL : process.env.TEST_MYSQL_URL
let config: DatabaseConfig
if (provider === 'sqlite') config = { provider, path }
else if (
  (provider === 'postgres' || provider === 'mysql') &&
  url &&
  new URL(url).pathname.endsWith('_test') &&
  (provider === 'postgres'
    ? ['postgres:', 'postgresql:'].includes(new URL(url).protocol)
    : new URL(url).protocol === 'mysql:')
) {
  config = { provider, url }
} else throw new Error('A matching disposable test database ending in _test is required')
let fixture: ReturnType<typeof createAuth> | undefined
let ownsBootstrap = false

test.beforeAll(async () => {
  if (config.provider === 'sqlite') await migrateSqlite(config.path)
  else if (config.provider === 'postgres') await migrate(config.url)
  else await migrateMysql(config.url)
  fixture = createAuth(config, secret, origin)
  if (
    (await fixture.db.selectFrom('user').select('id').execute()).length ||
    (await fixture.db.selectFrom('auth_bootstrap_guard').select('id').execute()).length
  ) {
    throw new Error('Test database must have no auth data')
  }
  await bootstrapFirstAdmin(fixture, {
    name: 'Admin',
    email: 'admin@example.test',
    username: 'exampleadmin',
    password,
  })
  ownsBootstrap = true
})

test.afterAll(async () => {
  if (!fixture) return
  try {
    if (ownsBootstrap && config.provider !== 'sqlite') {
      await fixture.db
        .deleteFrom('user')
        .where('email', 'in', ['admin@example.test', 'member@example.test'])
        .execute()
      await fixture.db.deleteFrom('auth_bootstrap_guard').where('id', '=', 1).execute()
    }
  } finally {
    await fixture.db.destroy()
  }
})

test('admin provisions a user, and both login methods enforce access', async ({
  page,
  request,
}) => {
  const blockedSignup = await request.post('/api/auth/sign-up/email', {
    headers: { origin },
    data: { name: 'Visitor', email: 'visitor@example.test', password },
  })
  expect(blockedSignup.status()).toBe(404)
  const blockedAdmin = await request.post('/api/auth/admin/create-user', {
    headers: { origin },
    data: { name: 'Visitor', email: 'visitor@example.test', password, role: 'admin' },
  })
  expect(blockedAdmin.status()).toBe(404)
  const blockedRoleChange = await request.post('/api/auth/admin/set-role', {
    headers: { origin },
    data: { userId: 'synthetic', role: 'admin' },
  })
  expect(blockedRoleChange.status()).toBe(404)
  const blockedSocial = await request.post('/api/auth/sign-in/social', {
    headers: { origin },
    data: { provider: 'google' },
  })
  expect(blockedSocial.status()).toBe(404)
  const crossOrigin = await request.post('/api/auth/sign-in/email', {
    headers: { origin: 'https://attacker.example' },
    data: { email: 'admin@example.test', password },
  })
  expect(crossOrigin.status()).toBe(403)
  const anonymousSession = await request.get('/api/auth/get-session')
  expect(anonymousSession.headers()['cache-control']).toContain('no-store')

  await page.goto('/account')
  await expect(page).toHaveURL(/\/login$/)
  await page.getByLabel('Username or email').fill('exampleadmin')
  await page.getByLabel('Password').fill('incorrect-synthetic-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('status')).toHaveText(
    'Sign-in failed. Check your credentials and try again.',
  )
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/account$/)
  await page.getByLabel('Name', { exact: true }).fill('Member')
  await page.getByLabel('Email', { exact: true }).fill('member@example.test')
  await page.getByLabel('Username', { exact: true }).fill('member')
  await page.getByLabel('Initial password').fill(password)
  const createCall = page.waitForRequest(
    (call) => call.method() === 'POST' && !new URL(call.url()).pathname.startsWith('/api/auth/'),
  )
  await page.getByRole('button', { name: 'Create account' }).click()
  const captured = await createCall
  await expect(
    page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: 'Create an account' }) })
      .getByRole('status'),
  ).toHaveText('Account created.')
  const headers = await captured.allHeaders()
  const crossOriginAction = await page.request.post(captured.url(), {
    headers: {
      'content-type': headers['content-type'] ?? 'application/json',
      ...(headers['x-tsr-serverfn'] ? { 'x-tsr-serverfn': headers['x-tsr-serverfn'] } : {}),
      origin: 'https://attacker.example',
    },
    data: captured.postDataBuffer() ?? undefined,
  })
  expect(crossOriginAction.status()).toBe(403)
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/login$/)
  const replay = () =>
    page.request.post(captured.url(), {
      headers: {
        'content-type': headers['content-type'] ?? 'application/json',
        ...(headers['x-tsr-serverfn'] ? { 'x-tsr-serverfn': headers['x-tsr-serverfn'] } : {}),
        origin,
      },
      data: captured.postDataBuffer() ?? undefined,
    })
  expect(await (await replay()).text()).toContain('AUTH_REQUIRED')
  await page.getByLabel('Username or email').fill('member@example.test')
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/account$/)
  const accountPage = await page.goto('/account')
  expect(accountPage?.headers()['cache-control']).toContain('no-store')
  await expect(page.getByRole('heading', { name: 'Create an account' })).toHaveCount(0)
  const result = await replay()
  expect(await result.text()).toContain('ADMIN_REQUIRED')
  await page.getByLabel('Current password').fill(password)
  await page.getByLabel('New password').fill('synthetic-new-password-456')
  await page.getByRole('button', { name: 'Change password' }).click()
  await expect(
    page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: 'Change password' }) })
      .getByRole('status'),
  ).toHaveText('Password changed. Other sessions were signed out.')
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await page.goto('/account')
  await expect(page).toHaveURL(/\/login$/)
  await page.getByLabel('Username or email').fill('member')
  await page.getByLabel('Password').fill('synthetic-new-password-456')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/account$/)
})
