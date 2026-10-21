'use client'
import { Button } from '@/components/common/button/Button'
import { InfiniteListMarker } from '@/components/common/InfiniteListMarker'
import { useInfinitePage, type InfinitePage } from '@/lib/useInfinitePage'
import { markNotificationRead } from '../actions'
import { getNotificationPage } from '../queries/getNotificationPage'
import type { NotificationItem } from '../types'

type Cursor = { createdAt: string; id: string }

export function NotificationList({
  initialPage,
}: {
  initialPage: InfinitePage<NotificationItem, Cursor>
}) {
  const { page, pending, markerRef } = useInfinitePage<NotificationItem, Cursor>({
    initialPage,
    fetchPage: (cursor) => getNotificationPage({ cursor }),
  })
  return (
    <>
      <section className="overflow-hidden rounded-lg border border-border bg-surface">
        {page.items.length === 0 ? (
          <p className="p-8 text-center text-muted">No notifications yet.</p>
        ) : (
          page.items.map((item) => (
            <article
              className={`flex flex-col justify-between gap-3 border-b border-border p-4 last:border-0 sm:flex-row ${item.read_at ? '' : 'bg-subtle'}`}
              key={item.id}
            >
              <div className="relative pl-4">
                {!item.read_at ? (
                  <span
                    className="absolute top-1.5 left-0 size-2 rounded-full bg-accent"
                    aria-label="Unread"
                  />
                ) : null}
                <strong className="font-semibold text-primary">{item.title}</strong>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.message}</p>
                <time className="mt-2 block text-xs text-muted" dateTime={item.created_at}>
                  {new Intl.DateTimeFormat('en-PH', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(item.created_at))}
                </time>
              </div>
              {!item.read_at && (
                <form action={markNotificationRead} className="self-start">
                  <input type="hidden" name="notificationId" value={item.id} />
                  <Button variant="ghost" type="submit">
                    Mark read
                  </Button>
                </form>
              )}
            </article>
          ))
        )}
      </section>
      <InfiniteListMarker
        markerRef={markerRef}
        pending={pending}
        hasMore={page.hasMore}
        pendingLabel="Loading notifications…"
      />
    </>
  )
}
