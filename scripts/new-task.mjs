import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export async function createTask(slug, directory = process.cwd()) {
  if (!slug || slug.length > 80 || !slugPattern.test(slug)) {
    throw new Error(
      'Task slug must be lowercase words separated by single hyphens (max 80 characters)',
    )
  }

  const file = join(directory, 'docs', 'tasks', `${slug}.md`)
  await mkdir(dirname(file), { recursive: true })

  const template = await readFile(new URL('../docs/tasks/TEMPLATE.md', import.meta.url), 'utf8')
  const content = template.replaceAll('{{slug}}', slug)
  await writeFile(file, content, { flag: 'wx' })
  return file
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const slug = process.argv[2]
  if (!slug || slug.length > 80 || !slugPattern.test(slug)) {
    console.error('Usage: bun run task:new short-task-name')
    process.exitCode = 1
  } else {
    const file = await createTask(slug)
    console.log(`${relative(process.cwd(), file)} created; existing tasks are never overwritten.`)
  }
}
