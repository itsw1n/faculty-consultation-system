'use client'

import { useActionState } from 'react'
import { SubmitButton } from '@/components/common/SubmitButton'
import { initialActionState } from '@/lib/actionState'
import { claimFirstAdmin } from '../actions'

export function ClaimAdminForm() {
  const [state, formAction] = useActionState(claimFirstAdmin, initialActionState)
  return (
    <form action={formAction} className="mt-6 grid gap-3">
      {state.error ? (
        <p className="text-sm font-semibold text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <SubmitButton pendingLabel="Claiming…">Claim administrator access</SubmitButton>
    </form>
  )
}
