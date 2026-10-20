'use client'

import { useActionState } from 'react'
import { SubmitButton } from '@/components/common/SubmitButton'
import { initialActionState } from '@/lib/actionState'
import { PasswordField } from './PasswordField'
import { updatePassword } from '../actions'

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(updatePassword, initialActionState)
  return (
    <form action={formAction} className="mt-6 grid gap-4">
      <PasswordField
        id="password"
        name="password"
        label="New password"
        autoComplete="new-password"
        placeholder="********"
        minLength={8}
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm new password"
        autoComplete="new-password"
        placeholder="********"
        minLength={8}
      />
      {state.error ? (
        <p className="text-sm font-semibold text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <SubmitButton pendingLabel="Saving…" className="mt-2">
        Save new password
      </SubmitButton>
    </form>
  )
}
