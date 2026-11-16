import { createFileRoute } from '@tanstack/react-router'

async function handleAuth(request: Request) {
  const { getAuth } = await import('../modules/auth/auth.server')
  const { handleAuthHttp } = await import('../modules/auth/auth-http.server')
  return handleAuthHttp(request, getAuth)
}

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => handleAuth(request),
      POST: ({ request }) => handleAuth(request),
    },
  },
})
