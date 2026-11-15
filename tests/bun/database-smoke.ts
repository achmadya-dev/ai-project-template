import { sql } from 'kysely'
import {
  createPortableDatabase,
  type DatabaseConfig,
} from '../../src/server/portable-database.server'

const configs: DatabaseConfig[] = [{ provider: 'sqlite', path: ':memory:' }]
for (const [provider, url] of [
  ['postgres', process.env.TEST_DATABASE_URL],
  ['mysql', process.env.TEST_MYSQL_URL],
] as const) {
  if (!url) continue
  const parsed = new URL(url)
  if (!parsed.pathname.endsWith('_test'))
    throw new Error('Database must be disposable and end in _test')
  if (provider === 'postgres' && !['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new Error('Expected a PostgreSQL URL')
  }
  if (provider === 'mysql' && parsed.protocol !== 'mysql:') throw new Error('Expected a MySQL URL')
  configs.push({ provider, url })
}

for (const config of configs) {
  const db = createPortableDatabase(config)
  try {
    const result = await sql<{ value: unknown }>`SELECT ${1} AS value`.execute(db)
    if (result.rows[0]?.value !== 1 && result.rows[0]?.value !== '1') {
      throw new Error(`${config.provider} returned an unexpected value`)
    }
    console.log(`${config.provider}: Bun database smoke passed`)
  } finally {
    await db.destroy()
  }
}
