import { readFile, rm, rmdir } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { tmpdir } from 'node:os'

export default async function teardown() {
  const directory = process.env.EXAMPLE_TEST_DIRECTORY
  if (
    directory &&
    process.env.EXAMPLE_TEST_OWNER &&
    dirname(directory) === tmpdir() &&
    basename(directory).startsWith('template-example-db-') &&
    (await readFile(join(directory, '.owner'), 'utf8').catch(() => '')) ===
      process.env.EXAMPLE_TEST_OWNER
  ) {
    await rm(join(directory, 'app'), { recursive: true, force: true })
    for (const file of [
      'example.sqlite',
      'example.sqlite-journal',
      'example.sqlite-wal',
      'example.sqlite-shm',
    ]) {
      await rm(join(directory, file), { force: true })
    }
    await rm(join(directory, '.owner'))
    await rmdir(directory)
  }
}
