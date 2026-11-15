import { betterAuth } from 'better-auth'
import { admin, username } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { createPortableDatabase, type DatabaseConfig } from '../../server/portable-database.server'
import { getEnv } from '../../server/env.server'
import { AppError } from '../../server/errors'

interface AuthDatabase {
  user: { id: string; email: string; role: string | null }
  auth_bootstrap_guard: { id: number }
}

export function createAuth(config: DatabaseConfig, secret: string, baseURL: string) {
  const db = createPortableDatabase<AuthDatabase>(config)
  const auth = betterAuth({
    database: { db, type: config.provider, transaction: true },
    secret,
    baseURL,
    emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 12 },
    rateLimit: {
      enabled: true,
      storage: 'database',
      customRules: {
        '/sign-in/email': { window: 60, max: 10 },
        '/sign-in/username': { window: 60, max: 10 },
        '/change-password': { window: 60, max: 10 },
      },
    },
    advanced: { ipAddress: { ipAddressHeaders: [] } },
    plugins: [username(), admin(), tanstackStartCookies()],
  })
  return { auth, db, origin: new URL(baseURL).origin }
}

let instance: ReturnType<typeof createAuth> | undefined

export function resolveAuthSettings(env: {
  authSecret: string | undefined
  authBaseUrl: string | undefined
  nodeEnv: string | undefined
}) {
  if (!env.authSecret || !env.authBaseUrl) {
    throw new AppError('internal', 'AUTH_NOT_CONFIGURED', 'Authentication is not configured', {
      expose: false,
    })
  }
  const url = new URL(env.authBaseUrl)
  const isLoopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    (url.protocol !== 'https:' && (env.nodeEnv === 'production' || !isLoopback))
  ) {
    throw new AppError('internal', 'AUTH_INVALID_ORIGIN', 'Authentication origin is invalid', {
      expose: false,
    })
  }
  return { secret: env.authSecret, origin: url.origin }
}

export function getAuth() {
  if (instance) return instance
  const env = getEnv()
  const settings = resolveAuthSettings(env)
  instance = createAuth(env.database, settings.secret, settings.origin)
  return instance
}
