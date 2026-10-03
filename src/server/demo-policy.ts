import type { Env } from './env.server'
import { AppError } from './errors'

type DemoEnv = Pick<Env, 'nodeEnv' | 'demoEnabled'>

export function isDemoEnabled(env: DemoEnv): boolean {
  return env.nodeEnv === 'development' && env.demoEnabled
}

export function requireDemo(env: DemoEnv): void {
  if (isDemoEnabled(env)) return
  throw new AppError('forbidden', 'DEMO_DISABLED', 'Development demo is disabled')
}
