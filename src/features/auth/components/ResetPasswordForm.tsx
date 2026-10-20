'use client'

import { useActionState } from 'react'
import { SubmitButton } from '@/components/common/SubmitButton'
import { initialActionState } from '@/lib/actionState'
import { updatePassword } from '../actions'

const fieldClass = 'grid gap-1.5 text-xs font-bold'
const controlClass =
  'min-h-11 rounded-lg border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus'

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(updatePassword, initialActionState)
  return (
    <form action={formAction} className="mt-7 grid gap-3">
      <label className={fieldClass}>
        New password
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
        Confirm new password
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
      <SubmitButton pendingLabel="Saving…">Save new password</SubmitButton>
    </form>
  )
}
