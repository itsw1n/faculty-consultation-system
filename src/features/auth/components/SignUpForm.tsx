'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { SubmitButton } from '@/components/common/SubmitButton'
import { initialActionState } from '@/lib/actionState'
import { signUpWithPassword } from '../actions'

const fieldClass = 'grid gap-1.5 text-xs font-bold'
const controlClass =
  'min-h-11 rounded-lg border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus'

export function SignUpForm() {
  const [state, formAction] = useActionState(signUpWithPassword, initialActionState)
  return (
    <form action={formAction} className="mt-7 grid gap-3">
      <label className={fieldClass}>
        Full name
        <input
          className={controlClass}
          name="fullName"
          autoComplete="name"
          placeholder="Juan Dela Cruz"
          required
          maxLength={120}
        />
      </label>
      <label className={fieldClass}>
        School email
        <input
          className={controlClass}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@acdeducation.com"
          required
        />
      </label>
      <label className={fieldClass}>
        Password
        <input
          className={controlClass}
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <label className={fieldClass}>
        Confirm password
        <input
          className={controlClass}
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <p className="min-h-5 text-sm font-semibold text-danger" role="alert">
        {state.error}
      </p>
      <p className="text-sm font-semibold text-primary" role="status">
        {state.message}
      </p>
      <SubmitButton pendingLabel="Creating account…">Create account</SubmitButton>
      <p className="text-sm font-semibold">
        Already registered?{' '}
        <Link className="text-primary underline" href="/">
          Sign in
        </Link>
      </p>
    </form>
  )
}
