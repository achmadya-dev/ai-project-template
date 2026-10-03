import { createMiddleware } from '@tanstack/react-start'
import { ZodError } from 'zod'
import { AppError, normalizeError, toPublicError, type PublicAppError } from './errors'
import { logger } from './logger.server'

export type RequestResult<T> = { ok: true; data: T } | { ok: false; error: PublicAppError }

function normalizeRequestError(error: unknown): AppError {
  if (error instanceof ZodError) {
    return new AppError('invalid_argument', 'INVALID_ARGUMENT', 'Invalid request parameters', {
      cause: error,
      details: error.issues.map((issue) => ({
        path: issue.path,
        code: issue.code,
        message: issue.message,
      })),
    })
  }

  return normalizeError(error)
}

export function requestMiddleware(operation: string) {
  return createMiddleware({ type: 'function' }).server(async ({ next }) => {
    const requestId = crypto.randomUUID()
    const startedAt = performance.now()

    try {
      const result = await next({ context: { requestId } })
      logger.info('request.completed', {
        requestId,
        operation,
        durationMs: Math.round(performance.now() - startedAt),
      })
      return result
    } catch (error) {
      const normalized = normalizeRequestError(error)
      const fields = {
        requestId,
        operation,
        durationMs: Math.round(performance.now() - startedAt),
        errorKind: normalized.kind,
        errorCode: normalized.code,
      }

      if (normalized.expose) logger.warn('request.rejected', fields)
      else logger.error('request.failed', fields)

      throw normalized
    }
  })
}

export async function handleRequest<T>(work: () => Promise<T>): Promise<RequestResult<T>> {
  try {
    return { ok: true, data: await work() }
  } catch (error) {
    const normalized = normalizeRequestError(error)
    if (!normalized.expose) throw normalized
    return { ok: false, error: toPublicError(normalized) }
  }
}
