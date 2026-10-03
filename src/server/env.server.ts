import { z } from 'zod'

const envSchema = z
  .object({
    DATABASE_URL: z.preprocess(
      (value) => (value === '' || value === undefined ? undefined : value),
      z.string().url().optional(),
    ),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  })
  .transform((value) => ({
    databaseUrl: value.DATABASE_URL,
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
