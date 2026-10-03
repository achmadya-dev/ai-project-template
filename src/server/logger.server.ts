import { getEnv } from './env.server'

export type LogFields = Record<string, unknown>

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const levelRank: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

function write(level: LogLevel, event: string, fields: LogFields = {}): void {
  if (levelRank[level] < levelRank[getEnv().logLevel]) return

  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...fields,
  })

  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else if (level === 'debug') console.debug(line)
  else console.info(line)
}

export const logger = {
  debug: (event: string, fields?: LogFields) => write('debug', event, fields),
  info: (event: string, fields?: LogFields) => write('info', event, fields),
  warn: (event: string, fields?: LogFields) => write('warn', event, fields),
  error: (event: string, fields?: LogFields) => write('error', event, fields),
}
