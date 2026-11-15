import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { authClient } from '../modules/auth/auth-client'

export const Route = createFileRoute('/login')({ component: Login })

function Login() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
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
      const result = identifier.includes('@')
        ? await authClient.signIn.email({ email: identifier.trim(), password })
        : await authClient.signIn.username({ username: identifier.trim(), password })
      if (result.error) {
        setMessage('Sign-in failed. Check your credentials and try again.')
      } else {
        await navigate({ to: '/account' })
      }
    } catch {
      setMessage('Sign-in is unavailable. Try again later.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-120 px-7 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Sign in</h1>
      <p className="mt-3 text-[#5c6e66]">Use the account created by your administrator.</p>
      <form onSubmit={submit} className="mt-8 grid gap-5">
        <label className="grid gap-2">
          Username or email
          <input
            className="rounded-md border border-[#cad8d0] bg-white px-3 py-2"
            autoComplete="username"
            disabled={!ready}
            required
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
          />
        </label>
        <label className="grid gap-2">
          Password
          <input
            className="rounded-md border border-[#cad8d0] bg-white px-3 py-2"
            type="password"
            autoComplete="current-password"
            disabled={!ready}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button
          className="rounded-md bg-[#18332d] px-4 py-3 font-semibold text-white disabled:opacity-50"
          type="submit"
          disabled={pending || !ready}
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
        <p role="status" aria-live="polite">
          {message}
        </p>
      </form>
    </main>
  )
}
