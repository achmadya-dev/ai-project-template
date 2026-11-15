import { expect } from 'vitest'
import { createAuth } from '../../src/modules/auth/auth.server'
import { bootstrapFirstAdmin } from '../../src/modules/auth/bootstrap.server'
import type { DatabaseConfig } from '../../src/server/portable-database.server'

export async function verifyProviderAuth(config: DatabaseConfig) {
  const instance = createAuth(
    config,
    'synthetic-test-secret-with-more-than-32-characters',
    'http://127.0.0.1:3000',
  )
  const password = 'synthetic-test-password-123'
  let initialized = false
  const createdIds: string[] = []
  try {
    const existing = await instance.db.selectFrom('user').select('id').execute()
    const guard = await instance.db.selectFrom('auth_bootstrap_guard').select('id').execute()
    if (existing.length || guard.length) throw new Error('Test database must have no auth data')
    const attempts = await Promise.allSettled(
      ['first', 'second'].map((username) =>
        bootstrapFirstAdmin(instance, {
          name: 'Admin',
          email: `${username}@example.test`,
          username,
          password,
        }),
      ),
    )
    expect(attempts.filter((result) => result.status === 'fulfilled')).toHaveLength(1)
    initialized = true
    const winner = attempts[0]?.status === 'fulfilled' ? 'first' : 'second'
    const signedIn = await instance.auth.api.signInEmail({
      body: { email: `${winner}@example.test`, password },
      returnHeaders: true,
    })
    createdIds.push(signedIn.response.user.id)
    const cookie = signedIn.headers.get('set-cookie')?.split(';')[0]
    if (!cookie) throw new Error('Expected a session cookie')
    const headers = new Headers({ cookie })
    const usernameLogin = await instance.auth.api.signInUsername({
      body: { username: winner.toUpperCase(), password },
    })
    expect(usernameLogin.user.email).toBe(`${winner}@example.test`)
    const created = await instance.auth.api.createUser({
      headers,
      body: {
        name: 'Member',
        email: 'member@example.test',
        password,
        role: 'user',
        data: { username: 'member' },
      },
    })
    createdIds.push(created.user.id)
    await expect(
      instance.auth.api.createUser({
        headers,
        body: {
          name: 'Duplicate username',
          email: 'other@example.test',
          password,
          role: 'user',
          data: { username: 'MEMBER' },
        },
      }),
    ).rejects.toThrow()
    await expect(
      instance.auth.api.createUser({
        headers,
        body: {
          name: 'Duplicate email',
          email: 'MEMBER@example.test',
          password,
          role: 'user',
          data: { username: 'other' },
        },
      }),
    ).rejects.toThrow()
    const member = await instance.auth.api.signInUsername({
      body: { username: 'member', password },
    })
    expect(member.user.email).toBe('member@example.test')
    await expect(
      bootstrapFirstAdmin(instance, {
        name: 'Third',
        email: 'third@example.test',
        username: 'third',
        password,
      }),
    ).rejects.toThrow()
    expect(await instance.auth.api.getSession({ headers })).not.toBeNull()
    await instance.auth.api.signOut({ headers })
    expect(await instance.auth.api.getSession({ headers })).toBeNull()
  } finally {
    try {
      if (initialized && createdIds.length > 0) {
        for (const id of createdIds) {
          await instance.db.deleteFrom('user').where('id', '=', id).execute()
        }
        await instance.db.deleteFrom('auth_bootstrap_guard').where('id', '=', 1).execute()
      }
    } finally {
      await instance.db.destroy()
    }
  }
}
