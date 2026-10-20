'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { SubmitButton } from '@/components/common/SubmitButton'
import { initialActionState } from '@/lib/actionState'
import { requestPasswordReset } from '../actions'

const fieldClass = 'grid gap-1.5 text-xs font-bold'
const controlClass =
  'min-h-11 rounded-lg border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus'

export function RequestResetForm() {
  const [state, formAction] = useActionState(requestPasswordReset, initialActionState)
  return (
    <form action={formAction} className="mt-7 grid gap-3">
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
      <p className="min-h-5 text-sm font-semibold text-danger" role="alert">
        {state.error}
      </p>
      <p className="text-sm font-semibold text-primary" role="status">
        {state.message}
      </p>
      <SubmitButton pendingLabel="Sending…">Send reset link</SubmitButton>
      <p className="text-sm font-semibold">
        <Link className="text-primary underline" href="/">
          Back to sign in
        </Link>
      </p>
    </form>
  )
}
