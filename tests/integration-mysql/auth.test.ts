import { it } from 'vitest'
import { migrateMysql } from '../../scripts/migrate-mysql.mjs'
import { verifyProviderAuth } from '../support/auth-provider'

const url = process.env.TEST_MYSQL_URL
if (!url || !new URL(url).pathname.endsWith('_test') || new URL(url).protocol !== 'mysql:') {
  throw new Error('TEST_MYSQL_URL must target a disposable MySQL database ending in _test')
}

it('supports administrator provisioning and both login methods on MySQL', async () => {
  await migrateMysql(url)
  await verifyProviderAuth({ provider: 'mysql', url })
}, 30000)
