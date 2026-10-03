import { z } from 'zod'

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.preprocess(
      (value) => (value === '' || value === undefined ? undefined : value),
      z.string().url().optional(),
    ),
    DEMO_ENABLED: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  })
  .transform((value) => ({
    nodeEnv: value.NODE_ENV,
    databaseUrl: value.DATABASE_URL,
    demoEnabled: value.DEMO_ENABLED,
    logLevel: value.LOG_LEVEL,
  }))

export type Env = z.infer<typeof envSchema>

let cachedEnv: Env | undefined

export function parseEnv(input: Record<string, string | undefined>): Env {
  return envSchema.parse(input)
}

export function getEnv(): Env {
  return (cachedEnv ??= parseEnv(process.env))
}
