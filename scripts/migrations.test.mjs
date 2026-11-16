import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import { runMigrations } from './migrate.mjs'
import { assertMigrationHistory, loadMigrations } from './migrations/shared.mjs'

const directories = []

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true })))
})

describe('shared migration utilities', () => {
  it('loads migration files by name in lexical order and ignores non-migrations', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'migration-files-'))
    directories.push(directory)
    await writeFile(join(directory, '002_create_session_table.sql'), 'CREATE TABLE session;')
    await writeFile(join(directory, '001_create_user_table.sql'), 'CREATE TABLE user;')
    await writeFile(join(directory, 'README.md'), 'Not a migration')
    await writeFile(join(directory, '001_invalid-name.SQL'), 'Not a migration')

    const migrations = await loadMigrations(directory)

    assert.deepEqual(
      migrations.map(({ name }) => name),
      ['001_create_user_table.sql', '002_create_session_table.sql'],
    )
    assert.equal(migrations[0].sql, 'CREATE TABLE user;')
    assert.match(migrations[0].checksum, /^[a-f0-9]{64}$/)
  })

  it('rejects removed, modified, or out-of-order applied migration history', async () => {
    const migrations = [
      { name: '001_create_user_table.sql', checksum: 'user-checksum' },
      { name: '002_create_session_table.sql', checksum: 'session-checksum' },
    ]

    assert.throws(
      () => assertMigrationHistory(migrations, [{ name: '000_removed.sql', checksum: 'old' }]),
      /Applied migration was removed/,
    )
    assert.throws(
      () =>
        assertMigrationHistory(migrations, [
          { name: migrations[0].name, checksum: 'changed-checksum' },
        ]),
      /Applied migration was modified/,
    )
    assert.throws(
      () =>
        assertMigrationHistory(migrations.slice(0, 1), [
          { name: migrations[1].name, checksum: migrations[1].checksum },
        ]),
      /Applied migration was removed/,
    )
    assert.throws(
      () =>
        assertMigrationHistory(migrations, [
          { name: migrations[1].name, checksum: migrations[1].checksum },
        ]),
      /Migration is out of order/,
    )
  })

  it('validates CLI provider configuration before connecting to a database', async () => {
    await assert.rejects(runMigrations({ DB_PROVIDER: 'unsupported' }), /Unsupported DB_PROVIDER/)
    await assert.rejects(
      runMigrations({ DB_PROVIDER: 'sqlite', DATABASE_URL: 'postgresql://localhost/app' }),
      /SQLite does not use DATABASE_URL/,
    )
    await assert.rejects(
      runMigrations({ DB_PROVIDER: 'postgres', DATABASE_URL: 'mysql://localhost/app' }),
      /PostgreSQL requires a matching DATABASE_URL/,
    )
  })
})
