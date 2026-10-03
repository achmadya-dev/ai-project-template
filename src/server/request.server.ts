import { logger, type LogFields } from './logger.server'
import { normalizeRequestError } from './request'

type RequestLogger = Pick<typeof logger, 'info' | 'warn' | 'error'>

type RequestRuntime = {
  logger?: RequestLogger
  requestId?: () => ReturnType<typeof crypto.randomUUID>
  now?: () => number
}

export async function runRequest<T>(
  operation: string,
  work: (requestId: ReturnType<typeof crypto.randomUUID>) => Promise<T>,
  runtime: RequestRuntime = {},
): Promise<T> {
  const requestLogger = runtime.logger ?? logger
  const requestId = (runtime.requestId ?? (() => crypto.randomUUID()))()
  const now = runtime.now ?? performance.now.bind(performance)
  const startedAt = now()

  try {
    const result = await work(requestId)
    requestLogger.info('request.completed', {
      requestId,
      operation,
      durationMs: Math.round(now() - startedAt),
    })
    return result
  } catch (error) {
    const normalized = normalizeRequestError(error)
    const fields: LogFields = {
      requestId,
      operation,
      durationMs: Math.round(now() - startedAt),
      errorKind: normalized.kind,
      errorCode: normalized.code,
    }

    if (normalized.expose) requestLogger.warn('request.rejected', fields)
    else requestLogger.error('request.failed', fields)

    throw normalized
  }
}
