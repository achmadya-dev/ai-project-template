// Pure policy; the server reads environment variables, never the browser.
export function isDemoEnabled(env: { NODE_ENV?: string; DEMO_ENABLED?: string }): boolean {
  return env.NODE_ENV === 'development' && env.DEMO_ENABLED === 'true'
}
export function requireDemo(env: { NODE_ENV?: string; DEMO_ENABLED?: string }): void {
  if (!isDemoEnabled(env)) throw new Error('Development demo is disabled')
}
