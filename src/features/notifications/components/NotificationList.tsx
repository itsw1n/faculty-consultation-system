'use client'
import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { unstable_rethrow } from 'next/navigation'
import { Button } from '@/components/common/button/Button'
import { InfiniteListMarker } from '@/components/common/InfiniteListMarker'
import { useInfinitePage, type InfinitePage } from '@/lib/useInfinitePage'
import { markAllNotificationsRead, markNotificationRead } from '../actions'
import { getNotificationPage } from '../queries/getNotificationPage'
import type { NotificationItem } from '../types'

type Cursor = { createdAt: string; id: string }

export function NotificationList({
  initialPage,
  unread,
}: {
  initialPage: InfinitePage<NotificationItem, Cursor>
  unread: number
}) {
  const [markingAll, setMarkingAll] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const { page, setPage, pending, error, retry, markerRef } = useInfinitePage<
    NotificationItem,
    Cursor
  >({
    initialPage,
    fetchPage: (cursor) => getNotificationPage({ cursor }),
    getKey: (item) => item.id,
  })

  async function markAll() {
    setMarkingAll(true)
    setActionError(null)
    try {
      await markAllNotificationsRead()
      const readAt = new Date().toISOString()
      setPage((current) => ({
        ...current,
        items: current.items.map((item) => (item.read_at ? item : { ...item, read_at: readAt })),
      }))
    } catch (error) {
      unstable_rethrow(error)
      setActionError('Unable to mark notifications as read. Please try again.')
    } finally {
      setMarkingAll(false)
    }
  }

  async function markOne(formData: FormData) {
    setActionError(null)
    try {
      await markNotificationRead(formData)
      const id = formData.get('notificationId')
      setPage((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.id === id ? { ...item, read_at: new Date().toISOString() } : item
        ),
      }))
    } catch (error) {
      unstable_rethrow(error)
      setActionError('Unable to mark the notification as read. Please try again.')
    }
  }

  return (
    <>
      {unread > 0 ? (
        <form action={markAll} className="mb-3 text-right">
          <Button variant="ghost" type="submit" isDisabled={markingAll}>
            {markingAll ? 'Marking…' : 'Mark all as read'}
          </Button>
        </form>
      ) : null}
      {actionError ? (
        <p
          role="alert"
          className="mb-3 rounded-lg border border-danger/20 bg-surface p-4 text-sm text-danger"
        >
          {actionError}
        </p>
      ) : null}
      <section className="overflow-hidden rounded-lg border border-border bg-surface">
        {page.items.length === 0 ? (
          <p className="p-8 text-center text-muted">No notifications yet.</p>
        ) : (
          page.items.map((item) => (
            <article
              className={`border-b border-border last:border-0 ${item.read_at ? '' : 'bg-subtle'}`}
              key={item.id}
            >
              {item.read_at ? (
                <NotificationContent item={item} />
              ) : (
                <form action={markOne}>
                  <input type="hidden" name="notificationId" value={item.id} />
                  <NotificationReadButton item={item} />
                </form>
              )}
            </article>
          ))
        )}
      </section>
      <InfiniteListMarker
        markerRef={markerRef}
        error={error}
        onRetry={retry}
        pending={pending}
        hasMore={page.hasMore}
        pendingLabel="Loading notifications…"
      />
    </>
  )
}

function NotificationReadButton({ item }: { item: NotificationItem }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={`Mark read: ${item.title}`}
      className="block w-full cursor-pointer text-left hover:bg-accent/10 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-focus disabled:cursor-wait disabled:opacity-60"
    >
      <NotificationContent item={item} pending={pending} />
    </button>
  )
}

function NotificationContent({
  item,
  pending = false,
}: {
  item: NotificationItem
  pending?: boolean
}) {
  return (
    <div className="flex flex-col justify-between gap-3 p-4 sm:flex-row">
      <div className="relative pl-4">
        {!item.read_at && (
          <span
            className="absolute top-1.5 left-0 size-2 rounded-full bg-accent"
            aria-hidden="true"
          />
        )}
        <strong className="font-semibold text-primary">{item.title}</strong>
        <p className="mt-1 text-sm leading-relaxed text-muted">{item.message}</p>
        <time className="mt-2 block text-xs text-muted" dateTime={item.created_at}>
          {new Intl.DateTimeFormat('en-PH', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Manila',
          }).format(new Date(item.created_at))}
        </time>
      </div>
      {!item.read_at && (
        <span className="self-start whitespace-nowrap text-sm font-semibold text-primary">
          {pending ? 'Marking…' : 'Mark read'}
        </span>
      )}
    </div>
  )
}
