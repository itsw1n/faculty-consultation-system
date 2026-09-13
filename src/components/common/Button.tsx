'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components'
import { cn } from '@/lib/cn'

export const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-hover',
        secondary: 'bg-surface text-primary ring-1 ring-border hover:bg-subtle',
        danger: 'bg-danger text-white hover:bg-danger-hover',
        ghost: 'bg-transparent text-primary hover:bg-subtle',
      },
      size: {
        default: 'min-h-11 px-4 py-2',
        compact: 'min-h-9 px-3 py-1.5',
      },
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  }
)

type ButtonProps = AriaButtonProps & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, fullWidth, ...props }: ButtonProps) {
  return (
    <AriaButton
      {...props}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
    />
  )
}
