'use client'

import { useActionState } from 'react'
import { SubmitButton } from '@/components/common/SubmitButton'
import { initialActionState } from '@/lib/actionState'
import { claimFirstAdmin } from '../actions'

export function ClaimAdminForm() {
  const [state, formAction] = useActionState(claimFirstAdmin, initialActionState)
  return (
    <form action={formAction} className="mx-auto mt-8 grid max-w-64 gap-3">
      <p className="min-h-5 text-sm font-semibold text-danger" role="alert">
        {state.error}
      </p>
      <SubmitButton pendingLabel="Claiming…">Claim administrator access</SubmitButton>
    </form>
  )
}
