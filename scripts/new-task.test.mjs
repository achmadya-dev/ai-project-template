import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { createTask } from './new-task.mjs'

const template = await readFile(new URL('../docs/tasks/TEMPLATE.md', import.meta.url), 'utf8')

test('creates tasks from the template and never overwrites an existing task', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'new-task-check-'))
  const taskPath = join(directory, 'docs', 'tasks', 'sample-task.md')

  try {
    await createTask('sample-task', directory)
    assert.equal(await readFile(taskPath, 'utf8'), template.replaceAll('{{slug}}', 'sample-task'))

    await writeFile(taskPath, 'keep this task')
    await assert.rejects(createTask('sample-task', directory), { code: 'EEXIST' })
    assert.equal(await readFile(taskPath, 'utf8'), 'keep this task')
    await assert.rejects(createTask('../invalid', directory), /Task slug/)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
