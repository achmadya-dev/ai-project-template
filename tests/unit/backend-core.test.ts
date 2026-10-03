import { describe, expect, it } from 'vitest'
import { parseEnv } from '../../src/server/env.server'
import { AppError, normalizeError, toPublicError } from '../../src/server/errors'

describe('server environment', () => {
  it('parses raw process values once into typed application config', () => {
    expect(
      parseEnv({
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://app:secret@127.0.0.1:5432/app_dev',
        DEMO_ENABLED: 'true',
        LOG_LEVEL: 'debug',
      }),
    ).toEqual({
      nodeEnv: 'development',
      databaseUrl: 'postgresql://app:secret@127.0.0.1:5432/app_dev',
      demoEnabled: true,
      logLevel: 'debug',
    })
  })

  it('treats an empty database URL as unconfigured and applies safe defaults', () => {
    expect(parseEnv({ DATABASE_URL: '' })).toEqual({
      nodeEnv: 'development',
      databaseUrl: undefined,
      demoEnabled: false,
      logLevel: 'info',
    })
  })

  it('rejects unsupported boolean-like values instead of guessing', () => {
    expect(() => parseEnv({ DEMO_ENABLED: 'yes' })).toThrow()
  })
})

describe('application errors', () => {
  it('keeps stable public kind and code for expected failures', () => {
    const error = new AppError('not_found', 'ITEM_NOT_FOUND', 'Item was not found')
    expect(toPublicError(error)).toEqual({
      kind: 'not_found',
      code: 'ITEM_NOT_FOUND',
      message: 'Item was not found',
    })
  })

  it('does not expose unexpected internal error details', () => {
    const error = normalizeError(new Error('postgresql://user:secret@example.invalid/private'))
    expect(toPublicError(error)).toEqual({
      kind: 'internal',
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    })
  })
})
