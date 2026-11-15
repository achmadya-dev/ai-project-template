import { it } from 'vitest'
import { migrate } from '../../scripts/migrate.mjs'
import { verifyProviderAuth } from '../support/auth-provider'

const url = process.env.TEST_DATABASE_URL
if (!url || !new URL(url).pathname.endsWith('_test')) {
  throw new Error('TEST_DATABASE_URL must target a disposable database ending in _test')
}

it('supports administrator provisioning and both login methods on PostgreSQL', async () => {
  await migrate(url)
  await verifyProviderAuth({ provider: 'postgres', url })
}, 30000)
