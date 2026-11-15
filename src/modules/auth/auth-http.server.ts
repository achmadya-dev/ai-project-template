import type { createAuth } from './auth.server'

const allowed = new Set([
  '/api/auth/sign-in/email',
  '/api/auth/sign-in/username',
  '/api/auth/get-session',
  '/api/auth/sign-out',
  '/api/auth/change-password',
])

export async function handleAuthHttp(request: Request, instance: ReturnType<typeof createAuth>) {
  const url = new URL(request.url)
  if (!allowed.has(url.pathname)) return new Response('Not found', { status: 404 })
  const origin = request.headers.get('origin')
  if ((request.method !== 'GET' && !origin) || (origin && origin !== instance.origin)) {
    return new Response('Origin not allowed', { status: 403 })
  }
  try {
    const response = await instance.auth.handler(request)
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch {
    return Response.json({ error: 'Authentication unavailable' }, { status: 503 })
  }
}
