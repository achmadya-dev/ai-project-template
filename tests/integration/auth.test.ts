import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { migrateSqlite } from '../../scripts/migrations/sqlite.mjs'
import { createAuth } from '../../src/modules/auth/auth.server'
import { handleAuthHttp } from '../../src/modules/auth/auth-http.server'
import { bootstrapFirstAdmin } from '../../src/modules/auth/bootstrap.server'

it('rejects public signup, permits one bootstrap, and supports username and email login', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'auth-sqlite-'))
  const path = join(directory, 'test.sqlite')
  await migrateSqlite(path)
  const instance = createAuth(
    { provider: 'sqlite', path },
    'synthetic-test-secret-with-more-than-32-characters',
    'http://127.0.0.1:3000',
  )
  const password = 'synthetic-test-password-123'
  const first = { name: 'Admin', email: 'admin@example.test', username: 'ExampleAdmin', password }
  try {
    const signup = await handleAuthHttp(
      new Request('http://127.0.0.1:3000/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1:3000' },
        body: JSON.stringify(first),
      }),
      () => instance,
    )
    expect(signup.status).toBe(404)
    const crossOrigin = await handleAuthHttp(
      new Request('http://127.0.0.1:3000/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: 'https://attacker.example' },
        body: JSON.stringify({ email: first.email, password }),
      }),
      () => instance,
    )
    expect(crossOrigin.status).toBe(403)
    const missingOrigin = await handleAuthHttp(
      new Request('http://127.0.0.1:3000/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: first.email, password }),
      }),
      () => instance,
    )
    expect(missingOrigin.status).toBe(403)
    const anonymousPasswordChange = await handleAuthHttp(
      new Request('http://127.0.0.1:3000/api/auth/change-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1:3000' },
        body: JSON.stringify({ currentPassword: password, newPassword: 'another-password-123' }),
      }),
      () => instance,
    )
    expect(anonymousPasswordChange.status).toBe(401)
    const results = await Promise.allSettled([
      bootstrapFirstAdmin(instance, first),
      bootstrapFirstAdmin(instance, {
        ...first,
        email: 'second@example.test',
        username: 'second',
      }),
    ])
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1)
    const users = await instance.db.selectFrom('user').selectAll().execute()
    expect(users).toHaveLength(1)
    const created = users[0]
    expect(created).toBeDefined()
    if (!created) throw new Error('Expected one user')
    const firstWon = created.id && results[0]?.status === 'fulfilled'
    const credentials = firstWon
      ? first
      : { ...first, email: 'second@example.test', username: 'second' }
    const byEmail = await instance.auth.api.signInEmail({
      body: { email: credentials.email, password },
      returnHeaders: true,
    })
    expect(byEmail.response.user.email).toBe(credentials.email)
    expect(byEmail.headers.get('set-cookie')).toContain('session_token')
    const cookie = byEmail.headers.get('set-cookie')?.split(';')[0]
    if (!cookie) throw new Error('Expected a session cookie')
    const adminHeaders = new Headers({ cookie })
    await instance.auth.api.createUser({
      headers: adminHeaders,
      body: {
        name: 'Member',
        email: 'member@example.test',
        password,
        role: 'user',
        data: { username: 'Member' },
      },
    })
    await expect(
      instance.auth.api.createUser({
        headers: adminHeaders,
        body: {
          name: 'Duplicate',
          email: 'other@example.test',
          password,
          role: 'user',
          data: { username: 'MEMBER' },
        },
      }),
    ).rejects.toThrow()
    const byUsername = await instance.auth.api.signInUsername({
      body: { username: credentials.username.toUpperCase(), password },
    })
    expect(byUsername.user.email).toBe(credentials.email)
    const member = await instance.auth.api.signInEmail({
      body: { email: 'member@example.test', password },
      returnHeaders: true,
    })
    const memberCookie = member.headers.get('set-cookie')?.split(';')[0]
    if (!memberCookie) throw new Error('Expected a member session cookie')
    await expect(
      instance.auth.api.createUser({
        headers: new Headers({ cookie: memberCookie }),
        body: {
          name: 'Not allowed',
          email: 'forbidden@example.test',
          password,
          role: 'admin',
        },
      }),
    ).rejects.toThrow()
    await expect(
      instance.auth.api.signInEmail({
        body: { email: credentials.email, password: 'wrong-password-123' },
      }),
    ).rejects.toThrow()
    expect(await instance.auth.api.getSession({ headers: adminHeaders })).not.toBeNull()
    await instance.auth.api.signOut({ headers: adminHeaders })
    expect(await instance.auth.api.getSession({ headers: adminHeaders })).toBeNull()
    await expect(bootstrapFirstAdmin(instance, first)).rejects.toThrow()

    let limited = false
    for (let attempt = 0; attempt < 12; attempt++) {
      const response = await handleAuthHttp(
        new Request('http://127.0.0.1:3000/api/auth/sign-in/email', {
          method: 'POST',
          headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1:3000' },
          body: JSON.stringify({ email: 'unknown@example.test', password }),
        }),
        () => instance,
      )
      if (response.status === 429) {
        limited = true
        break
      }
    }
    expect(limited).toBe(true)
  } finally {
    await instance.db.destroy()
    await rm(directory, { recursive: true })
  }
}, 30000)

it('issues secure, HTTP-only cookies for HTTPS origins', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'auth-cookie-'))
  const path = join(directory, 'test.sqlite')
  await migrateSqlite(path)
  const instance = createAuth(
    { provider: 'sqlite', path },
    'synthetic-test-secret-with-more-than-32-characters',
    'https://app.example.test',
  )
  const password = 'synthetic-test-password-123'
  try {
    await bootstrapFirstAdmin(instance, {
      name: 'Admin',
      email: 'admin@example.test',
      username: 'admin',
      password,
    })
    const result = await instance.auth.api.signInEmail({
      body: { email: 'admin@example.test', password },
      returnHeaders: true,
    })
    const cookie = result.headers.get('set-cookie')
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('Secure')
    expect(cookie).toMatch(/SameSite=Lax/i)
    expect(cookie).not.toContain(password)
  } finally {
    await instance.db.destroy()
    await rm(directory, { recursive: true })
  }
}, 30000)
