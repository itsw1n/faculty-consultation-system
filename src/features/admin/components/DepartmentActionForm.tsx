'use client'

import { useActionState, type ReactNode } from 'react'
import { unstable_rethrow } from 'next/navigation'
import { SubmitButton } from '@/components/common/SubmitButton'

type Feedback = { error: string | null; message: string | null }

/** Presents local feedback while keeping the authorized server action unchanged. */
export function DepartmentActionForm({
  action,
  id,
  departmentId,
  children,
  label,
  successMessage,
  className,
}: {
  action: (data: FormData) => Promise<void>
  id?: string
  departmentId?: string
  children?: ReactNode
  label: string
  successMessage: string
  className?: string
}) {
  const [state, formAction] = useActionState(
    async (previous: Feedback, data: FormData): Promise<Feedback> => {
      try {
        await action(data)
        return { error: null, message: successMessage }
      } catch (error) {
        unstable_rethrow(error)
        return {
          ...previous,
          error:
            'Could not save this department. Check the fields and use a unique code and name, then try again.',
          message: null,
        }
      }
    },
    { error: null, message: null }
  )
  return (
    <form id={id} action={formAction} className={className}>
      {departmentId && <input type="hidden" name="id" value={departmentId} />}
      {children}
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <SubmitButton
          className={
            departmentId
              ? 'w-auto whitespace-nowrap bg-surface text-foreground ring-border hover:bg-subtle'
              : 'w-auto whitespace-nowrap'
          }
          pendingLabel="Saving…"
        >
          {label}
        </SubmitButton>
        {state.error && (
          <p role="alert" className="max-w-sm text-left text-xs leading-relaxed text-danger">
            {state.error}
          </p>
        )}
        {state.message && (
          <p role="status" className="text-xs text-success">
            {state.message}
          </p>
        )}
      </div>
    </form>
  )
}
