import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

export function Container({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div data-ui="container" className={cn('mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-10', className)} {...props} />
}
