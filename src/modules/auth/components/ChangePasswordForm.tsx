import { useEffect, useState, type FormEvent } from 'react'
import { authClient } from '../auth-client'

export function ChangePasswordForm() {
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
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      })
      if (result.error) {
        setMessage('Password could not be changed. Check your current password.')
        return
      }
      setCurrentPassword('')
      setNewPassword('')
      setMessage('Password changed. Other sessions were signed out.')
    } catch {
      setMessage('Password could not be changed. Try again later.')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="mt-10 border-t border-[#d9e2db] pt-8">
      <h2 className="text-2xl font-bold">Change password</h2>
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <label className="grid gap-2">
          Current password
          <input
            className="rounded-md border bg-white px-3 py-2"
            type="password"
            autoComplete="current-password"
            required
            disabled={pending || !ready}
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
            disabled={pending || !ready}
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
          {pending ? 'Changing…' : 'Change password'}
        </button>
      </form>
      <p role="status" aria-live="polite" className="mt-4">
        {message}
      </p>
    </section>
  )
}
