import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const root = fileURLToPath(new URL('../', import.meta.url))

test('root prototype sources and captures are ignored without hiding maintained source', () => {
  const files = [
    'prototypes/planning/index.html',
    'prototypes/planning/styles.css',
    'prototypes/planning/app.js',
    'prototypes/planning/experiment.ts',
    'prototypes/planning/NOTES.md',
    'prototypes/planning/screenshots/mobile.png',
    'prototypes/planning/nested/variant/index.html',
  ]
  const ignored = execFileSync('git', ['check-ignore', '--no-index', '--stdin'], {
    cwd: root,
    input: `${files.join('\n')}\n`,
    encoding: 'utf8',
  })
  assert.deepEqual(ignored.trim().split('\n'), files)

  const maintained = spawnSync(
    'git',
    ['check-ignore', '--no-index', 'src/prototype-control.ts', 'docs/PROTOTYPING.md'],
    { cwd: root, encoding: 'utf8' },
  )
  assert.equal(maintained.status, 1, maintained.stderr)
  assert.equal(maintained.stdout, '')
})

test('no prototype workspace files are tracked', () => {
  const tracked = execFileSync('git', ['ls-files', '--', 'prototypes/'], {
    cwd: root,
    encoding: 'utf8',
  })
  assert.equal(tracked, '', 'Keep prototype source and captures local; do not force-add them')
})
