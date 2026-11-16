import { useEffect, useState, type FormEvent } from 'react'
import { createAccount } from '../auth.functions'

export function CreateAccountForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage('')
    try {
      const result = await createAccount({ data: { name, email, username, password } })
      if (!result.ok) {
        setMessage('Account could not be created. Check the details and try again.')
        return
      }
      setName('')
      setEmail('')
      setUsername('')
      setPassword('')
      setMessage('Account created.')
    } catch {
      setMessage('Account could not be created. Check the details and try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="mt-10 border-t border-[#d9e2db] pt-8">
      <h2 className="text-2xl font-bold">Create an account</h2>
      <p className="mt-2 text-[#5c6e66]">
        Share the initial password with the person through a secure channel.
      </p>
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <label className="grid gap-2">
          Name
          <input
            className="rounded-md border bg-white px-3 py-2"
            required
            disabled={pending || !ready}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="grid gap-2">
          Email
          <input
            className="rounded-md border bg-white px-3 py-2"
            type="email"
            required
            disabled={pending || !ready}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="grid gap-2">
          Username
          <input
            className="rounded-md border bg-white px-3 py-2"
            required
            disabled={pending || !ready}
            minLength={3}
            maxLength={30}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>
        <label className="grid gap-2">
          Initial password
          <input
            className="rounded-md border bg-white px-3 py-2"
            type="password"
            autoComplete="new-password"
            required
            disabled={pending || !ready}
            minLength={12}
            maxLength={128}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button
          className="rounded-md bg-[#18332d] px-4 py-3 font-semibold text-white disabled:opacity-50"
          type="submit"
          disabled={pending || !ready}
        >
          {pending ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p role="status" aria-live="polite" className="mt-4">
        {message}
      </p>
    </section>
  )
}
