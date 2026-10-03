export type AppErrorKind =
  | 'invalid_argument'
  | 'not_found'
  | 'conflict'
  | 'unauthorized'
  | 'forbidden'
  | 'rate_limited'
  | 'internal'

export type AppErrorSpec = {
  kind: AppErrorKind
  code: string
  message: string
}

export type PublicAppError = AppErrorSpec

type AppErrorOptions = {
  cause?: unknown
  expose?: boolean
  details?: unknown
}

export class AppError extends Error {
  readonly kind: AppErrorKind
  readonly code: string
  readonly expose: boolean
  readonly details?: unknown

  constructor(kind: AppErrorKind, code: string, message: string, options: AppErrorOptions = {}) {
    super(message, { cause: options.cause })
    this.name = 'AppError'
    this.kind = kind
    this.code = code
    this.expose = options.expose ?? kind !== 'internal'
    this.details = options.details
  }
}

export function appError(spec: AppErrorSpec, options: AppErrorOptions = {}): AppError {
  return new AppError(spec.kind, spec.code, spec.message, options)
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error

  return new AppError('internal', 'INTERNAL_ERROR', 'Internal server error', {
    cause: error,
    expose: false,
  })
}

export function toPublicError(error: AppError): PublicAppError {
  if (!error.expose) {
    return {
      kind: 'internal',
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    }
  }

  return {
    kind: error.kind,
    code: error.code,
    message: error.message,
  }
}
