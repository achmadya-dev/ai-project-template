import { createFileRoute } from '@tanstack/react-router'

async function handleAuth(request: Request) {
  const { getAuth } = await import('../modules/auth/auth.server')
  const { handleAuthHttp } = await import('../modules/auth/auth-http.server')
  try {
    return await handleAuthHttp(request, getAuth())
  } catch {
    return Response.json({ error: 'Authentication unavailable' }, { status: 503 })
  }
}

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => handleAuth(request),
      POST: ({ request }) => handleAuth(request),
    },
  },
})
