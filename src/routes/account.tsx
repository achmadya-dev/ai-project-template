import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { authClient } from '../modules/auth/auth-client'
import { ChangePasswordForm } from '../modules/auth/components/ChangePasswordForm'
import { CreateAccountForm } from '../modules/auth/components/CreateAccountForm'
import { getCurrentUser } from '../modules/auth/auth.functions'
import { hasAdminRole } from '../modules/auth/domain/role'

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
  const [message, setMessage] = useState('')
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])

  async function signOut() {
    const result = await authClient.signOut()
    if (result.error) setMessage('Sign-out failed. Try again.')
    else await navigate({ to: '/login' })
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
      {hasAdminRole(user.role) && <CreateAccountForm />}
      <ChangePasswordForm />
      <p role="status" aria-live="polite" className="mt-4">
        {message}
      </p>
    </main>
  )
}
