'use client'
import { useFormStatus } from 'react-dom'
import { buttonVariants } from './Button'
import { cn } from '@/lib/cn'

export function SubmitButton({
  children,
  pendingLabel = 'Submitting…',
  className,
}: {
  children: string
  pendingLabel?: string
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className={cn(buttonVariants({ fullWidth: true }), className)}
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? pendingLabel : children}
    </button>
  )
}
