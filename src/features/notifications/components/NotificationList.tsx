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
      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        {page.items.length === 0 ? (
          <p className="p-8 text-center text-muted">No notifications yet.</p>
        ) : (
          page.items.map((item) => (
            <article
              className={`flex justify-between gap-4 border-b border-border p-4 last:border-0 ${item.read_at ? '' : 'bg-blue-50'}`}
              key={item.id}
            >
              <div>
                <strong>{item.title}</strong>
                <p className="mt-1 text-muted">{item.message}</p>
                <time className="mt-1 text-xs text-muted" dateTime={item.created_at}>
                  {new Intl.DateTimeFormat('en-PH', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(item.created_at))}
                </time>
              </div>
              {!item.read_at && (
                <form action={markNotificationRead}>
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
