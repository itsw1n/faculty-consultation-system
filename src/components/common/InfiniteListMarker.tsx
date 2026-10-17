'use client'

import type { RefObject } from 'react'

export function InfiniteListMarker({
  markerRef,
  pending,
  hasMore,
  pendingLabel,
}: {
  markerRef: RefObject<HTMLDivElement | null>
  pending: boolean
  hasMore: boolean
  pendingLabel: string
}) {
  return (
    <div
      ref={markerRef}
      className="grid min-h-12 place-items-center text-sm text-muted"
      aria-live="polite"
    >
      {pending ? pendingLabel : hasMore ? 'Scroll for more' : ''}
    </div>
  )
}
