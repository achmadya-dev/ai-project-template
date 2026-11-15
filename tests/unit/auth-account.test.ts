import { describe, expect, it } from 'vitest'
import { createAccountInput } from '../../src/modules/auth/domain/account'

describe('administrator account input', () => {
  it('normalizes identity values', () => {
    expect(
      createAccountInput.parse({
        name: ' Example ',
        email: 'EXAMPLE@EXAMPLE.TEST',
        username: 'Example_User',
        password: 'synthetic-password-123',
      }),
    ).toMatchObject({
      name: 'Example',
      email: 'example@example.test',
      username: 'example_user',
    })
  })

  it('rejects short passwords, invalid usernames and client-supplied roles', () => {
    const valid = {
      name: 'Example',
      email: 'example@example.test',
      username: 'example',
      password: 'synthetic-password-123',
    }
    expect(createAccountInput.safeParse({ ...valid, password: 'short' }).success).toBe(false)
    expect(createAccountInput.safeParse({ ...valid, username: 'name@example.test' }).success).toBe(
      false,
    )
    expect(createAccountInput.safeParse({ ...valid, role: 'admin' }).success).toBe(false)
  })
})
