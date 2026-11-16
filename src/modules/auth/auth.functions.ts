import { createServerFn } from '@tanstack/react-start'
import { AppError } from '../../server/errors'
import { handleRequest, requestMiddleware } from '../../server/request'
import { createAccountInput } from './domain/account'
import { hasAdminRole } from './domain/role'

export const getCurrentUser = createServerFn({ method: 'GET' })
  .middleware([requestMiddleware('auth.get-current-user')])
  .handler(async () => {
    const { getRequestHeaders, setResponseHeader } = await import('@tanstack/react-start/server')
    const { getAuth } = await import('./auth.server')
    setResponseHeader('Cache-Control', 'private, no-store')
    const session = await getAuth().auth.api.getSession({ headers: getRequestHeaders() })
    if (!session) return null
    return {
      id: session.user.id,
      name: session.user.name,
      role: session.user.role,
    }
  })

export const createAccount = createServerFn({ method: 'POST' })
  .middleware([requestMiddleware('auth.create-account')])
  .validator((input: unknown) => createAccountInput.parse(input))
  .handler(async ({ data }) => {
    const { getRequestHeaders } = await import('@tanstack/react-start/server')
    const { getAuth } = await import('./auth.server')
    const auth = getAuth().auth
    const headers = getRequestHeaders()
    return handleRequest(async () => {
      const session = await auth.api.getSession({ headers })
      if (!session) throw new AppError('unauthorized', 'AUTH_REQUIRED', 'Sign in required')
      if (!hasAdminRole(session.user.role)) {
        throw new AppError('forbidden', 'ADMIN_REQUIRED', 'Administrator access required')
      }
      await auth.api.createUser({
        headers,
        body: {
          name: data.name,
          email: data.email,
          password: data.password,
          role: 'user',
          data: { username: data.username },
        },
      })
      return { created: true }
    })
  })
