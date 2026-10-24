'use client'

import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react'
import { usePathname } from 'next/navigation'

/** Native disclosure with predictable dismissal, preserving server-rendered content. */
export function ShellDisclosure(props: ComponentPropsWithoutRef<'details'>) {
  const ref = useRef<HTMLDetailsElement>(null)
  const pathname = usePathname()
  const previousPath = useRef(pathname)
  useEffect(() => {
    // A native menu may already be open while its JavaScript is loading.
    // Dismiss on an actual route change, preserving that early interaction.
    if (previousPath.current !== pathname && ref.current) ref.current.open = false
    previousPath.current = pathname
  }, [pathname])
  useEffect(() => {
    const node = ref.current
    function dismiss(event: PointerEvent | KeyboardEvent) {
      if (!node?.open) return
      if (event instanceof KeyboardEvent) {
        if (event.key !== 'Escape') return
        node.open = false
        node.querySelector('summary')?.focus()
      } else if (!node.contains(event.target as Node)) node.open = false
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', dismiss)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', dismiss)
    }
  }, [])
  return (
    <details
      {...props}
      ref={ref}
      onClick={(event) => {
        if ((event.target as Element).closest('a') && ref.current) ref.current.open = false
      }}
    />
  )
}
