import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

export function Section({ className, ...props }: ComponentPropsWithoutRef<'section'>) {
  return <section data-ui="section" className={cn('py-6 sm:py-8', className)} {...props} />
}
