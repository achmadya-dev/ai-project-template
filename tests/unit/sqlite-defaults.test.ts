import { readFileSync } from 'node:fs'
import { parseEnv as parseDotenv } from 'node:util'
import { describe, expect, it } from 'vitest'
import { parseEnv } from '../../src/server/env.server'

describe('SQLite-first template defaults', () => {
  it('uses SQLite when no database provider or URL is configured', () => {
    expect(parseEnv({}).database).toEqual({ provider: 'sqlite', path: '.data/app.sqlite' })
  })

  it('keeps the example environment and agent metadata SQLite-first', () => {
    const example = parseDotenv(
      readFileSync(new URL('../../.env.example', import.meta.url), 'utf8'),
    )
    const metadata = JSON.parse(
      readFileSync(new URL('../../.ai/project.json', import.meta.url), 'utf8'),
    )

    expect(parseEnv(example).database).toEqual({ provider: 'sqlite', path: '.data/app.sqlite' })
    expect(example.TEST_DATABASE_URL).toBeUndefined()
    expect(example.TEST_MYSQL_URL).toBeUndefined()
    expect(metadata).toMatchObject({ stack: 'tanstack-start-bun-sqlite' })
  })

  it('preserves explicitly configured server providers and rejects conflicts', () => {
    const postgres = 'postgresql://app:synthetic@127.0.0.1:5432/app_dev'
    const mysql = 'mysql://app:synthetic@127.0.0.1:3307/app_dev'

    expect(parseEnv({ DATABASE_URL: postgres }).database).toEqual({
      provider: 'postgres',
      url: postgres,
    })
    expect(parseEnv({ DB_PROVIDER: 'mysql', DATABASE_URL: mysql }).database).toEqual({
      provider: 'mysql',
      url: mysql,
    })
    expect(() => parseEnv({ DB_PROVIDER: 'sqlite', DATABASE_URL: postgres })).toThrow()
  })

  it('requires explicit Compose profiles for server database services', () => {
    const compose = readFileSync(new URL('../../compose.yaml', import.meta.url), 'utf8')

    expect(compose).toMatch(/^\s{2}db:\n\s{4}image: postgres:[^\n]+\n\s{4}profiles: \[postgres\]/m)
    expect(compose).toMatch(/^\s{2}db-test:\n\s{4}image: postgres:[^\n]+\n\s{4}profiles: \[test\]/m)
    expect(compose).toMatch(/^\s{2}mysql:\n\s{4}image: mysql:[^\n]+\n\s{4}profiles: \[mysql\]/m)
    expect(compose).toMatch(/^\s{2}mysql-test:\n\s{4}image: mysql:[^\n]+\n\s{4}profiles: \[test\]/m)
  })
})
