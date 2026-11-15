import { readFile, rm, rmdir } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { tmpdir } from 'node:os'

export default async function teardown() {
  const directory = process.env.AUTH_TEST_DIRECTORY
  if (
    directory &&
    process.env.AUTH_TEST_OWNER &&
    dirname(directory) === tmpdir() &&
    basename(directory).startsWith('template-auth-db-') &&
    (await readFile(join(directory, '.owner'), 'utf8').catch(() => '')) ===
      process.env.AUTH_TEST_OWNER
  ) {
    for (const file of [
      'auth.sqlite',
      'auth.sqlite-journal',
      'auth.sqlite-wal',
      'auth.sqlite-shm',
    ]) {
      await rm(join(directory, file), { force: true })
    }
    await rm(join(directory, '.owner'))
    await rmdir(directory)
  }
}
