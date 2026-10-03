import { createMiddleware } from '@tanstack/react-start'
import { ZodError } from 'zod'
import { AppError, normalizeError, toPublicError, type PublicAppError } from './errors'

export type RequestResult<T> = { ok: true; data: T } | { ok: false; error: PublicAppError }

export function normalizeRequestError(error: unknown): AppError {
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
    const { runRequest } = await import('./request.server')
    return runRequest(operation, (requestId) => next({ context: { requestId } }))
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
