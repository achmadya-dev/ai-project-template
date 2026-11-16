import { randomUUID } from 'node:crypto'
import { copyFile, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { migrate } from '../../scripts/migrations/postgres.mjs'
import { createPortableDatabase } from '../../src/server/portable-database.server'

interface MigrationDatabase {
  schema_migrations: { name: string; checksum: string }
}

const url = process.env.TEST_DATABASE_URL
if (!url || !new URL(url).pathname.endsWith('_test')) {
  throw new Error('TEST_DATABASE_URL must target a disposable database ending in _test')
}

const db = createPortableDatabase<MigrationDatabase>({ provider: 'postgres', url })
afterAll(() => db.destroy())

describe('PostgreSQL migrations', () => {
  it('applies the matching provider history idempotently', async () => {
    await migrate(url)
    await migrate(url)

    await expect(
      db.selectFrom('schema_migrations').select('name').orderBy('name').execute(),
    ).resolves.toEqual([
      { name: '001_create_user_table.sql' },
      { name: '002_create_session_table.sql' },
      { name: '003_create_account_table.sql' },
      { name: '004_create_verification_table.sql' },
      { name: '005_create_rate_limit_table.sql' },
      { name: '006_create_session_user_id_index.sql' },
      { name: '007_create_account_user_id_index.sql' },
      { name: '008_create_verification_identifier_index.sql' },
      { name: '009_create_auth_bootstrap_guard_table.sql' },
    ])
  })

  it('refuses to rewrite an applied migration', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'postgres-migrations-'))
    const migrationId = randomUUID().replaceAll('-', '')
    const migrationName = `010_create_migration_probe_${migrationId}.sql`
    const migrationPath = join(directory, migrationName)
    const tableName = `migration_probe_${migrationId}`

    try {
      const migrationDirectory = join(process.cwd(), 'db/migrations/postgres')
      for (const name of await readdir(migrationDirectory)) {
        await copyFile(join(migrationDirectory, name), join(directory, name))
      }
      await writeFile(migrationPath, `CREATE TABLE "${tableName}" (id integer PRIMARY KEY);`)
      await migrate(url, directory)
      await migrate(url, directory)

      const sql = await readFile(migrationPath, 'utf8')
      await writeFile(migrationPath, `${sql}\n-- modified`)
      await expect(migrate(url, directory)).rejects.toThrow('modified')
    } finally {
      await db.deleteFrom('schema_migrations').where('name', '=', migrationName).execute()
      await db.schema.dropTable(tableName).ifExists().execute()
      await rm(directory, { recursive: true })
    }
  })
})
