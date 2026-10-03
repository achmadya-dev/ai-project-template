import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { parseEnv } from '../../src/server/env.server'
import { AppError, normalizeError, toPublicError } from '../../src/server/errors'
import type { LogFields } from '../../src/server/logger.server'
import { runRequest } from '../../src/server/request.server'
import { handleRequest } from '../../src/server/request'

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

describe('request boundary', () => {
  it('adds a request id and duration to successful request logs', async () => {
    const requestId = crypto.randomUUID()
    const logs: { level: string; event: string; fields?: LogFields }[] = []
    let time = 100
    const runtimeLogger = {
      info(event: string, fields?: LogFields) {
        logs.push({ level: 'info', event, fields })
      },
      warn(event: string, fields?: LogFields) {
        logs.push({ level: 'warn', event, fields })
      },
      error(event: string, fields?: LogFields) {
        logs.push({ level: 'error', event, fields })
      },
    }

    await expect(
      runRequest('backend-core.test', async (id) => id, {
        logger: runtimeLogger,
        requestId: () => requestId,
        now: () => (time += 5),
      }),
    ).resolves.toBe(requestId)

    expect(logs).toEqual([
      {
        level: 'info',
        event: 'request.completed',
        fields: { requestId, operation: 'backend-core.test', durationMs: 5 },
      },
    ])
  })

  it('normalizes and logs validation failures with safe stable fields', async () => {
    const requestId = crypto.randomUUID()
    const logs: { level: string; event: string; fields?: LogFields }[] = []
    const runtimeLogger = {
      info(event: string, fields?: LogFields) {
        logs.push({ level: 'info', event, fields })
      },
      warn(event: string, fields?: LogFields) {
        logs.push({ level: 'warn', event, fields })
      },
      error(event: string, fields?: LogFields) {
        logs.push({ level: 'error', event, fields })
      },
    }

    await expect(
      runRequest('backend-core.invalid', async () => z.string().parse(42), {
        logger: runtimeLogger,
        requestId: () => requestId,
        now: () => 100,
      }),
    ).rejects.toMatchObject({
      kind: 'invalid_argument',
      code: 'INVALID_ARGUMENT',
      message: 'Invalid request parameters',
    })

    expect(logs).toEqual([
      {
        level: 'warn',
        event: 'request.rejected',
        fields: {
          requestId,
          operation: 'backend-core.invalid',
          durationMs: 0,
          errorKind: 'invalid_argument',
          errorCode: 'INVALID_ARGUMENT',
        },
      },
    ])
  })

  it('returns exposed application errors using only the public contract', async () => {
    await expect(
      handleRequest(async () => {
        throw new AppError('conflict', 'DUPLICATE_SKU', 'SKU already exists', {
          details: { internal: 'must not be returned' },
        })
      }),
    ).resolves.toEqual({
      ok: false,
      error: {
        kind: 'conflict',
        code: 'DUPLICATE_SKU',
        message: 'SKU already exists',
      },
    })
  })

  it('normalizes schema failures to a stable invalid-argument result', async () => {
    const schema = z.object({ sku: z.string() })

    await expect(handleRequest(async () => schema.parse({ sku: 42 }))).resolves.toMatchObject({
      ok: false,
      error: {
        kind: 'invalid_argument',
        code: 'INVALID_ARGUMENT',
        message: 'Invalid request parameters',
      },
    })
  })

  it('rethrows unexpected failures as non-exposed internal errors', async () => {
    const cause = new Error('postgres://user:secret@db.example/private')

    await expect(
      handleRequest(async () => {
        throw cause
      }),
    ).rejects.toMatchObject({
      kind: 'internal',
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      expose: false,
      cause,
    })
  })
})
