import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { authClient } from '../modules/auth/auth-client'
import { createAccount, getCurrentUser } from '../modules/auth/auth.functions'

export const Route = createFileRoute('/account')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) throw redirect({ to: '/login' })
    return { user }
  },
  component: Account,
})

function Account() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
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
      if (!result.ok) setMessage('Account could not be created. Check the details and try again.')
      else {
        setName('')
        setEmail('')
        setUsername('')
        setPassword('')
        setMessage('Account created.')
      }
    } catch {
      setMessage('Account could not be created. Check the details and try again.')
    } finally {
      setPending(false)
    }
  }

  async function signOut() {
    const result = await authClient.signOut()
    if (result.error) setMessage('Sign-out failed. Try again.')
    else await navigate({ to: '/login' })
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage('')
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      })
      if (result.error) setMessage('Password could not be changed. Check your current password.')
      else {
        setCurrentPassword('')
        setNewPassword('')
        setMessage('Password changed. Other sessions were signed out.')
      }
    } catch {
      setMessage('Password could not be changed. Try again later.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-140 px-7 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-widest uppercase">Account</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Hello, {user.name}</h1>
        </div>
        <button type="button" className="underline" onClick={signOut} disabled={!ready}>
          Sign out
        </button>
      </div>
      {user.role?.split(',').includes('admin') && (
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
                disabled={!ready}
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
                disabled={!ready}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="grid gap-2">
              Username
              <input
                className="rounded-md border bg-white px-3 py-2"
                required
                disabled={!ready}
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
                disabled={!ready}
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
        </section>
      )}
      <section className="mt-10 border-t border-[#d9e2db] pt-8">
        <h2 className="text-2xl font-bold">Change password</h2>
        <form onSubmit={changePassword} className="mt-6 grid gap-4">
          <label className="grid gap-2">
            Current password
            <input
              className="rounded-md border bg-white px-3 py-2"
              type="password"
              autoComplete="current-password"
              required
              disabled={!ready}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </label>
          <label className="grid gap-2">
            New password
            <input
              className="rounded-md border bg-white px-3 py-2"
              type="password"
              autoComplete="new-password"
              required
              disabled={!ready}
              minLength={12}
              maxLength={128}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </label>
          <button
            className="rounded-md bg-[#18332d] px-4 py-3 font-semibold text-white disabled:opacity-50"
            type="submit"
            disabled={pending || !ready}
          >
            Change password
          </button>
        </form>
      </section>
      <p role="status" aria-live="polite" className="mt-4">
        {message}
      </p>
    </main>
  )
}
