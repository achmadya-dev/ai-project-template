import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validatePr } from './check-pr.mjs'
const body = `Closes #12
Risk: low
## Goal
Make item names visible to operators.
## Changes
Render existing item names on the page.
## Verification
npm run check passed at commit abc123.
## Compatibility and recovery
No schema change; revert the application artifact.
## Documentation
Updated task acceptance criteria and evidence.
`
test('accepts complete low-risk PR metadata', () => assert.deepEqual(validatePr(body, ['src/routes/index.tsx']), []))
test('rejects incomplete evidence', () => assert.ok(validatePr(body.replace('npm run check passed at commit abc123.', 'TODO'), []).length))
test('rejects missing issue', () => assert.ok(validatePr(body.replace('Closes #12', ''), []).length))
test('escalates governance edits', () => assert.ok(validatePr(body, ['.github/workflows/ci.yml']).some(e => e.includes('Sensitive'))))
test('allows high-risk classification but does not approve it', () => assert.deepEqual(validatePr(body.replace('Risk: low', 'Risk: high'), ['scripts/check-pr.mjs']), []))
