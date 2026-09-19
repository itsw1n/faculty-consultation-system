'use client'

import type { ReactNode } from 'react'
import { Button, Dialog, Heading, Modal as AriaModal, ModalOverlay } from 'react-aria-components'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

type ModalProps = {
  title: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  className?: string
}

export function Modal({ title, isOpen, onOpenChange, children, className }: ModalProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className="fixed inset-0 z-50 grid place-items-center bg-primary/55 p-4"
    >
      <AriaModal
        className={cn(
          'flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-surface shadow-dialog',
          className
        )}
      >
        <Dialog className="flex min-h-0 flex-1 flex-col outline-none">
          <header className="flex shrink-0 items-start justify-between gap-4 px-6 pt-6">
            <Heading slot="title" className="text-xl font-bold">
              {title}
            </Heading>
            <Button
              slot="close"
              aria-label="Close"
              className="grid size-9 shrink-0 place-items-center rounded-lg text-muted outline-none hover:bg-subtle hover:text-foreground focus-visible:ring-3 focus-visible:ring-focus"
            >
              <X size={18} aria-hidden="true" />
            </Button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-2 pb-6">{children}</div>
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  )
}
