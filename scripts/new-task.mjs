import { mkdir, writeFile } from 'node:fs/promises'
const slug = process.argv[2]
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) {
  console.error('Usage: bun run task:new short-task-name')
  process.exit(1)
}
const file = `docs/tasks/${slug}.md`
await mkdir('docs/tasks', { recursive: true })
const content = `# ${slug}

Status: draft
Risk: medium
Issue: not-created
PR: not-created
Plan revision: 1
Authorization: pending

## Goal
TODO: user outcome and why it matters.

## Scope
TODO: included work and explicit boundaries.

## Acceptance criteria
- [ ] AC-1: TODO observable behavior, with an example.

## Domain invariants
TODO: rules that must remain true, or explain not applicable.

## Plan
1. TODO implementation steps and relevant files.

## Verification plan
TODO map each acceptance criterion to a test or manual observation.

## Compatibility and recovery
TODO API/schema/data impact and recovery limits.

## Decisions and questions
TODO material unknowns only; routine assumptions should be stated.

## Evidence
Not executed yet. Record command, actual result, relevant revision, limitations.
`
await writeFile(file, content, { flag: 'wx' })
console.log(`Created ${file}; existing tasks are never overwritten.`)
