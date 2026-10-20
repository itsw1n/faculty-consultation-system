'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { SubmitButton } from '@/components/common/SubmitButton'
import { initialActionState } from '@/lib/actionState'
import { PasswordField } from './PasswordField'
import { signUpWithPassword } from '../actions'

const fieldClass = 'grid gap-1.5 text-sm font-semibold'
const controlClass =
  'min-h-12 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-focus'

export function SignUpForm() {
  const [state, formAction] = useActionState(signUpWithPassword, initialActionState)
  return (
    <form action={formAction} className="mt-6 grid gap-4">
      <label className={fieldClass} htmlFor="fullName">
        Full name
        <input
          id="fullName"
          className={controlClass}
          name="fullName"
          autoComplete="name"
          placeholder="Juan Dela Cruz"
          required
          maxLength={120}
        />
      </label>
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
        autoComplete="new-password"
        placeholder="********"
        minLength={8}
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        placeholder="********"
        minLength={8}
      />
      {state.error ? (
        <p className="text-sm font-semibold text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <p className="text-sm font-semibold text-primary" role="status">
        {state.message}
      </p>
      <SubmitButton pendingLabel="Creating account…" className="mt-2">
        Create account
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        Already registered?{' '}
        <Link className="font-semibold text-primary hover:underline" href="/">
          Sign in
        </Link>
      </p>
    </form>
  )
}
