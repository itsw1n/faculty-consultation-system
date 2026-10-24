'use client'

import type { RefObject } from 'react'
import { Button } from './button/Button'

export function InfiniteListMarker({
  markerRef,
  pending,
  hasMore,
  pendingLabel,
  error,
  onRetry,
}: {
  markerRef: RefObject<HTMLDivElement | null>
  pending: boolean
  hasMore: boolean
  pendingLabel: string
  error: string | null
  onRetry: () => void
}) {
  return (
    <div
      ref={markerRef}
      className="grid min-h-12 place-items-center gap-3 py-3 text-sm text-muted"
      aria-live="polite"
    >
      {error ? (
        <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-lg border border-danger/20 bg-surface p-4">
          <p role="alert">{error}</p>
          <Button variant="secondary" onPress={onRetry} isDisabled={pending}>
            Try again
          </Button>
        </div>
      ) : pending ? (
        pendingLabel
      ) : hasMore ? (
        'Scroll for more'
      ) : (
        ''
      )}
    </div>
  )
}
