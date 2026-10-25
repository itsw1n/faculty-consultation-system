'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { SubmitButton } from '@/components/common/SubmitButton'
import { initialActionState } from '@/lib/actionState'
import { PasswordField } from './PasswordField'
import { signInWithPassword } from '../actions'

const fieldClass = 'grid gap-1.5 text-sm font-semibold'
const controlClass =
  'min-h-12 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none transition focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-focus'

export function SignInForm() {
  const [state, formAction] = useActionState(signInWithPassword, initialActionState)

  return (
    <form action={formAction} className="mt-6 grid gap-4">
      <label className={fieldClass} htmlFor="email">
        School email
        <input
          id="email"
          className={controlClass}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@acdeducation.com"
          required
        />
      </label>
      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="current-password"
        placeholder="********"
      />
      {state.error ? (
        <p className="text-sm font-semibold text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <SubmitButton pendingLabel="Signing in…" className="mt-2">
        Sign in
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link className="font-semibold text-primary hover:underline" href="/auth/sign-up">
          Create account
        </Link>
      </p>
    </form>
  )
}
