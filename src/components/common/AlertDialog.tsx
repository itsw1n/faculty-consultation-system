'use client'

import { useActionState, useEffect, useRef } from 'react'
import { Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from 'react-aria-components'
import { Button } from './button/Button'

type DialogActionState = { error: string | null; success: boolean }
const initialDialogState: DialogActionState = { error: null, success: false }

type AlertDialogProps = {
  label: string
  accessibleLabel?: string
  title: string
  description: string
  fields: Record<string, string | string[]>
  submitAction: (formData: FormData) => Promise<void>
  variant?: 'primary' | 'danger'
  disabled?: boolean
  onSuccess?: () => void
}

export function AlertDialog({
  label,
  accessibleLabel,
  title,
  description,
  fields,
  submitAction,
  variant = 'primary',
  disabled = false,
  onSuccess,
}: AlertDialogProps) {
  const [state, formAction, pending] = useActionState(
    async (_previous: DialogActionState, formData: FormData) => {
      try {
        await submitAction(formData)
        return { error: null, success: true }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Something went wrong. Try again.',
          success: false,
        }
      }
    },
    initialDialogState
  )
  const handledSuccess = useRef(false)

  useEffect(() => {
    if (!state.success || handledSuccess.current) return
    handledSuccess.current = true
    onSuccess?.()
  }, [state.success, onSuccess])

  return (
    <DialogTrigger>
      <Button
        variant={variant}
        size="compact"
        className="min-w-0"
        isDisabled={disabled}
        aria-label={accessibleLabel}
      >
        {label}
      </Button>
      <ModalOverlay
        className="fixed inset-0 z-50 grid place-items-center bg-primary/55 p-4"
        isDismissable
      >
        <Modal className="w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-dialog">
          <Dialog role="alertdialog" className="outline-none">
            {({ close }) => (
              <>
                <Heading slot="title" className="text-xl font-semibold text-primary">
                  {title}
                </Heading>
                <p className="mt-2 text-muted">{description}</p>
                <form action={formAction}>
                  {Object.entries(fields).flatMap(([name, values]) =>
                    (Array.isArray(values) ? values : [values]).map((value) => (
                      <input key={`${name}-${value}`} type="hidden" name={name} value={value} />
                    ))
                  )}
                  <p className="mt-3 min-h-5 text-sm font-semibold text-danger" role="alert">
                    {state.error}
                  </p>
                  <div className="mt-3 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onPress={close}>
                      Go back
                    </Button>
                    <Button type="submit" variant={variant} isDisabled={pending}>
                      {pending ? 'Saving…' : label}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}
