import { rm, rmdir } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { tmpdir } from 'node:os'

export default async function teardown() {
  const directory = process.env.EXAMPLE_TEST_DIRECTORY
  if (
    directory &&
    dirname(directory) === tmpdir() &&
    basename(directory).startsWith('template-example-db-')
  ) {
    for (const file of [
      'example.sqlite',
      'example.sqlite-journal',
      'example.sqlite-wal',
      'example.sqlite-shm',
    ]) {
      await rm(join(directory, file), { force: true })
    }
    await rmdir(directory)
  }
}
