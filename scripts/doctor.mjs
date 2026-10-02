import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const major = Number(process.versions.node.split('.')[0])
console.log(`${major >= 24 ? 'OK' : 'CHECK'} Node ${process.versions.node}; CI uses Node 24`)
for (const file of ['.env', 'node_modules', 'package-lock.json', 'AGENTS.md']) console.log(`${existsSync(file) ? 'OK' : 'MISSING'} ${file}`)
try { execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { stdio: 'pipe' }); console.log('OK git worktree') } catch { console.log('SETUP git init -b main') }
try { execFileSync('gh', ['auth', 'status'], { stdio: 'pipe' }); console.log('OK GitHub CLI authenticated') } catch { console.log('OPTIONAL GitHub CLI not ready; use docs/tasks for local planning') }
const owners = readFileSync('.github/CODEOWNERS', 'utf8')
console.log(owners.split('\n').some(line => /^\*\s+@/.test(line)) ? 'OK CODEOWNERS configured (verify account access)' : 'SETUP configure CODEOWNERS with a real reviewer')
console.log('MANUAL GitHub rulesets and required checks must be configured on GitHub. Files alone do not enable protection.')
