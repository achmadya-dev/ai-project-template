import { describe, expect, it } from 'vitest'
import { hasAdminRole } from '../../src/modules/auth/domain/role'

describe('authentication roles', () => {
  it('recognizes the admin role in a role list', () => {
    expect(hasAdminRole('user,admin')).toBe(true)
    expect(hasAdminRole('admin,user')).toBe(true)
  })

  it('does not grant admin access to partial, absent, or unrelated roles', () => {
    expect(hasAdminRole('administrator')).toBe(false)
    expect(hasAdminRole('user')).toBe(false)
    expect(hasAdminRole(null)).toBe(false)
    expect(hasAdminRole(undefined)).toBe(false)
  })
})
