import { spawn } from 'node:child_process'
import { setTimeout } from 'node:timers/promises'
import assert from 'node:assert/strict'

assert.ok(process.versions.bun, 'Production smoke harness must run on Bun')
const port = '3120'
const server = spawn(process.execPath, ['.output/server/index.mjs'], {
  env: {
    ...process.env,
    DATABASE_URL: '',
    HOST: '127.0.0.1',
    PORT: port,
  },
  stdio: ['ignore', 'pipe', 'pipe'],
})
let output = ''
server.stdout.on('data', (data) => {
  output += data.toString()
})
server.stderr.on('data', (data) => {
  output += data.toString()
})
let startupError
server.on('error', (error) => {
  startupError = error
})
try {
  let response
  for (let attempt = 0; attempt < 60; attempt++) {
    if (startupError) throw startupError
    if (server.exitCode !== null) throw new Error(`Server exited: ${output}`)
    try {
      response = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(1000) })
      break
    } catch {
      await setTimeout(250)
    }
  }
  assert.ok(response, `Production server did not start: ${output}`)
  assert.equal(response.status, 200, output)
  const html = await response.text()
  assert.ok(html.includes('<html lang="en">'), 'Home page must declare English as its language')
  assert.ok(html.includes('YOUR NEXT PROJECT STARTS HERE'), 'Home page should render the template')
  assert.ok(html.includes('From planning'), 'Home page should render English hero copy')
  assert.ok(
    html.includes('One repo. Clear plans. Verified changes.'),
    'Footer copy should be English',
  )
  assert.ok(!html.includes('Catalog items'), 'Home page must not expose the catalog demo')
  assert.ok(!html.includes('name="sku"'), 'Home page must not expose the catalog form')
  console.log(
    `Production smoke passed on Bun ${process.versions.bun}: HTTP 200, template home rendered without DB credentials.`,
  )
} finally {
  server.kill('SIGTERM')
  await Promise.race([new Promise((resolve) => server.once('exit', resolve)), setTimeout(3000)])
  if (server.exitCode === null) server.kill('SIGKILL')
}
