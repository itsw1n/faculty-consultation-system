'use client'

import { Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from 'react-aria-components'
import { Button } from './Button'

type ConfirmActionProps = {
  label: string
  title: string
  description: string
  fields: Record<string, string | string[]>
  submitAction: (formData: FormData) => Promise<void>
  variant?: 'primary' | 'danger'
  disabled?: boolean
}

export function ConfirmAction({
  label,
  title,
  description,
  fields,
  submitAction,
  variant = 'primary',
  disabled = false,
}: ConfirmActionProps) {
  return (
    <DialogTrigger>
      <Button variant={variant} size="compact" isDisabled={disabled}>
        {label}
      </Button>
      <ModalOverlay
        className="fixed inset-0 z-50 grid place-items-center bg-primary/55 p-4"
        isDismissable
      >
        <Modal className="w-full max-w-lg rounded-xl bg-surface p-6 shadow-dialog">
          <Dialog role="alertdialog" className="outline-none">
            {({ close }) => (
              <>
                <Heading slot="title" className="text-xl font-bold">
                  {title}
                </Heading>
                <p className="mt-2 text-muted">{description}</p>
                <form action={submitAction}>
                  {Object.entries(fields).flatMap(([name, values]) =>
                    (Array.isArray(values) ? values : [values]).map((value) => (
                      <input key={`${name}-${value}`} type="hidden" name={name} value={value} />
                    ))
                  )}
                  <div className="mt-6 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onPress={close}>
                      Go back
                    </Button>
                    <Button type="submit" variant={variant}>
                      {label}
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
