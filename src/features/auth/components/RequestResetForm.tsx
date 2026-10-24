'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { SubmitButton } from '@/components/common/SubmitButton'
import { initialActionState } from '@/lib/actionState'
import { requestPasswordReset } from '../actions'

const fieldClass = 'grid gap-1.5 text-sm font-semibold'
const controlClass =
  'min-h-12 rounded-md border border-border bg-surface px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-focus'

export function RequestResetForm() {
  const [state, formAction] = useActionState(requestPasswordReset, initialActionState)
  return (
    <form action={formAction} className="mt-6 grid gap-4">
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
      {state.error ? (
        <p className="text-sm font-semibold text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="text-sm font-semibold text-primary" role="status">
          {state.message}
        </p>
      ) : null}
      <SubmitButton pendingLabel="Sending…">Send reset link</SubmitButton>
      <p className="text-sm font-semibold">
        <Link className="text-primary underline" href="/">
          Back to sign in
        </Link>
      </p>
    </form>
  )
}
