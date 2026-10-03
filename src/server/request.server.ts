import { randomUUID } from 'node:crypto'
import { createMiddleware } from '@tanstack/react-start'
import { z } from 'zod'
import { AppError, normalizeError, toPublicError, type PublicAppError } from './errors.server'
import { logger } from './logger.server'

export type RequestResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: PublicAppError }

export function requestMiddleware(operation: string) {
  return createMiddleware({ type: 'function' }).server(async ({ next }) => {
    const requestId = randomUUID()
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
      const normalized = normalizeError(error)
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

export function validateRequest<TSchema extends z.ZodType>(schema: TSchema) {
  return createMiddleware({ type: 'function' })
    .validator((input: z.input<TSchema>) => {
      const parsed = schema.safeParse(input)
      if (parsed.success) return parsed.data

      throw new AppError('invalid_argument', 'INVALID_ARGUMENT', 'Invalid request parameters', {
        details: parsed.error.issues.map((issue) => ({
          path: issue.path,
          code: issue.code,
          message: issue.message,
        })),
      })
    })
    .server(({ next }) => next())
}

export async function asRequestResult<T>(work: () => Promise<T>): Promise<RequestResult<T>> {
  try {
    return { ok: true, data: await work() }
  } catch (error) {
    const normalized = normalizeError(error)
    if (!normalized.expose) throw normalized
    return { ok: false, error: toPublicError(normalized) }
  }
}
