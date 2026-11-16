import { afterEach, describe, expect, it, vi } from 'vitest'
import { logger } from '../../src/server/logger.server'
import { handleAuthHttp } from '../../src/modules/auth/auth-http.server'

describe('auth HTTP handler', () => {
  afterEach(() => vi.restoreAllMocks())

  it('logs a safe failure and returns a generic response when auth initialization fails', async () => {
    const log = vi.spyOn(logger, 'error').mockImplementation(() => {})
    const request = new Request('http://127.0.0.1:3000/api/auth/sign-in/email', {
      method: 'POST',
      headers: { origin: 'http://127.0.0.1:3000' },
    })

    const response = await handleAuthHttp(request, () => {
      throw new Error('private database details')
    })

    expect(response.status).toBe(503)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    await expect(response.json()).resolves.toEqual({ error: 'Authentication unavailable' })
    expect(log).toHaveBeenCalledWith('auth.request.failed', {
      operation: 'auth.http',
      method: 'POST',
      path: '/api/auth/sign-in/email',
      errorName: 'Error',
    })
  })

  it('rejects unknown endpoints before initializing authentication', async () => {
    const getAuth = vi.fn()
    const request = new Request('http://127.0.0.1:3000/api/auth/admin/create')

    const response = await handleAuthHttp(request, getAuth)

    expect(response.status).toBe(404)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(getAuth).not.toHaveBeenCalled()
  })
})
