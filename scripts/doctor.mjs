import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const expectedBun = readFileSync('.bun-version', 'utf8').trim()
const actualBun = process.versions.bun
console.log(`${actualBun === expectedBun ? 'OK' : 'CHECK'} Bun runtime ${actualBun ?? 'not detected'}; expected ${expectedBun}`)

try {
  const actualNode = execFileSync('node', ['--version'], { encoding: 'utf8' }).trim()
  console.log(`TOOLING ${actualNode}; retained for Vitest/Playwright compatibility, not application runtime`)
} catch {
  console.log('TOOLING Node not found; Bun app commands work, but the current Vitest/Playwright toolchain may require Node 24')
}

for (const file of ['.env', 'node_modules', 'bun.lock', 'AGENTS.md']) console.log(`${existsSync(file) ? 'OK' : 'MISSING'} ${file}`)
try { execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { stdio: 'pipe' }); console.log('OK git worktree') } catch { console.log('SETUP git init -b main') }
try { execFileSync('gh', ['auth', 'status'], { stdio: 'pipe' }); console.log('OK GitHub CLI authenticated') } catch { console.log('OPTIONAL GitHub CLI not ready; use docs/tasks for local planning') }
const owners = readFileSync('.github/CODEOWNERS', 'utf8')
console.log(owners.split('\n').some(line => /^\*\s+@/.test(line)) ? 'OK CODEOWNERS configured (verify account access)' : 'SETUP configure CODEOWNERS with a real reviewer')
console.log('MANUAL GitHub rulesets and required checks must be configured on GitHub. Files alone do not enable protection.')
