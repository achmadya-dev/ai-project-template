import { describe, expect, it } from 'vitest'
import { resolveAuthSettings } from '../../src/modules/auth/auth.server'

const secret = 'synthetic-secret-with-at-least-32-characters'

describe('auth configuration', () => {
  it('allows loopback HTTP for development and HTTPS for production', () => {
    expect(
      resolveAuthSettings({
        authSecret: secret,
        authBaseUrl: 'http://127.0.0.1:3000',
        nodeEnv: 'development',
      }).origin,
    ).toBe('http://127.0.0.1:3000')
    expect(
      resolveAuthSettings({
        authSecret: secret,
        authBaseUrl: 'https://example.test',
        nodeEnv: 'production',
      }).origin,
    ).toBe('https://example.test')
  })

  it('fails closed for missing settings, insecure or non-origin URLs', () => {
    expect(() =>
      resolveAuthSettings({ authSecret: undefined, authBaseUrl: undefined, nodeEnv: 'production' }),
    ).toThrow()
    for (const authBaseUrl of [
      'http://example.test',
      'http://localhost:3000',
      'https://user@example.test',
      'https://example.test/path',
      'https://example.test/?x=1',
    ]) {
      expect(() =>
        resolveAuthSettings({ authSecret: secret, authBaseUrl, nodeEnv: 'production' }),
      ).toThrow()
    }
  })
})
