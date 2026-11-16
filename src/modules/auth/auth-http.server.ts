import { logger } from '../../server/logger.server'
import type { createAuth } from './auth.server'

const allowed = new Set([
  '/api/auth/sign-in/email',
  '/api/auth/sign-in/username',
  '/api/auth/get-session',
  '/api/auth/sign-out',
  '/api/auth/change-password',
])

function noStore(response: Response) {
  response.headers.set('Cache-Control', 'no-store')
  return response
}

export async function handleAuthHttp(
  request: Request,
  getAuth: () => ReturnType<typeof createAuth>,
) {
  const url = new URL(request.url)
  if (!allowed.has(url.pathname)) return noStore(new Response('Not found', { status: 404 }))
  try {
    const instance = getAuth()
    const origin = request.headers.get('origin')
    if ((request.method !== 'GET' && !origin) || (origin && origin !== instance.origin)) {
      return noStore(new Response('Origin not allowed', { status: 403 }))
    }
    const response = await instance.auth.handler(request)
    return noStore(response)
  } catch (error) {
    logger.error('auth.request.failed', {
      operation: 'auth.http',
      method: request.method,
      path: url.pathname,
      errorName: error instanceof Error ? error.name : 'unknown',
    })
    return noStore(Response.json({ error: 'Authentication unavailable' }, { status: 503 }))
  }
}
