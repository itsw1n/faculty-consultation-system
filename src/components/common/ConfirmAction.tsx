'use client'

import { Button, Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from 'react-aria-components'

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
      <Button className={`confirm-trigger ${variant}`} isDisabled={disabled}>
        {label}
      </Button>
      <ModalOverlay className="modal-overlay" isDismissable>
        <Modal className="confirm-modal">
          <Dialog role="alertdialog">
            {({ close }) => (
              <>
                <Heading slot="title">{title}</Heading>
                <p>{description}</p>
                <form action={submitAction}>
                  {Object.entries(fields).flatMap(([name, values]) =>
                    (Array.isArray(values) ? values : [values]).map((value) => (
                      <input key={`${name}-${value}`} type="hidden" name={name} value={value} />
                    )),
                  )}
                  <div className="dialog-actions">
                    <Button type="button" onPress={close}>
                      Go back
                    </Button>
                    <Button type="submit" className={variant}>
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
