import { z } from 'zod'
import type { DatabaseConfig } from './portable-database.server'

const envSchema = z
  .object({
    DATABASE_URL: z.preprocess(
      (value) => (value === '' || value === undefined ? undefined : value),
      z.string().url().optional(),
    ),
    DB_PROVIDER: z.enum(['sqlite', 'postgres', 'mysql']).optional(),
    SQLITE_PATH: z.string().min(1).default('.data/app.sqlite'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    AUTH_SECRET: z.string().min(32).optional(),
    AUTH_BASE_URL: z.string().url().optional(),
    NODE_ENV: z.string().optional(),
  })
  .superRefine((value, context) => {
    const provider = value.DB_PROVIDER
    const url = value.DATABASE_URL
    if (provider === 'sqlite' && url) {
      context.addIssue({ code: 'custom', message: 'SQLite does not use DATABASE_URL' })
    } else if (provider === 'postgres' || provider === 'mysql') {
      const expected = provider === 'postgres' ? ['postgres:', 'postgresql:'] : ['mysql:']
      if (!url || !expected.includes(new URL(url).protocol)) {
        context.addIssue({
          code: 'custom',
          message: `${provider} requires a matching DATABASE_URL`,
        })
      }
    } else if (
      !provider &&
      url &&
      !['postgres:', 'postgresql:', 'mysql:'].includes(new URL(url).protocol)
    ) {
      context.addIssue({ code: 'custom', message: 'Unsupported DATABASE_URL scheme' })
    }
  })
  .transform((value) => {
    const url = value.DATABASE_URL
    const provider =
      value.DB_PROVIDER ??
      (url ? (new URL(url).protocol === 'mysql:' ? 'mysql' : 'postgres') : 'sqlite')
    let database: DatabaseConfig
    if (provider === 'sqlite') database = { provider, path: value.SQLITE_PATH }
    else if (url) database = { provider, url }
    else throw new Error('Database URL missing after validation')
    return {
      databaseUrl: url,
      database,
      logLevel: value.LOG_LEVEL,
      authSecret: value.AUTH_SECRET,
      authBaseUrl: value.AUTH_BASE_URL,
      nodeEnv: value.NODE_ENV,
    }
  })

export type Env = z.infer<typeof envSchema>

let cachedEnv: Env | undefined

export function parseEnv(input: Record<string, string | undefined>): Env {
  return envSchema.parse(input)
}

export function getEnv(): Env {
  return (cachedEnv ??= parseEnv(process.env))
}
