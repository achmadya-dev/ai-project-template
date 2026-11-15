import { createInterface } from 'node:readline/promises'
import { Writable } from 'node:stream'
import { getAuth } from '../src/modules/auth/auth.server'
import { bootstrapFirstAdmin } from '../src/modules/auth/bootstrap.server'

if (process.argv.length !== 2 || !process.stdin.isTTY || !process.stdout.isTTY) {
  throw new Error(
    'Run interactively without arguments; credentials must not be passed on the command line',
  )
}

let muted = false
const output = new Writable({
  write(chunk: Buffer, _encoding, callback) {
    if (!muted) process.stdout.write(chunk)
    callback()
  },
})
const prompt = createInterface({ input: process.stdin, output, terminal: true })
try {
  const name = await prompt.question('Name: ')
  const email = await prompt.question('Email: ')
  const username = await prompt.question('Username: ')
  process.stdout.write('Password: ')
  muted = true
  const password = await prompt.question('')
  muted = false
  process.stdout.write('\n')
  const instance = getAuth()
  try {
    await bootstrapFirstAdmin(instance, { name, email, username, password })
    console.log('Initial administrator created.')
  } finally {
    await instance.db.destroy()
  }
} catch {
  console.error(
    'Unable to create the initial administrator. Inspect configuration and bootstrap state.',
  )
  process.exitCode = 1
} finally {
  prompt.close()
}
