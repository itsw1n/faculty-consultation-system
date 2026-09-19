'use client'
import { useEffect, useRef, useState, useTransition } from 'react'
import { AlertDialog } from '@/components/common/AlertDialog'
import { StatusBadge } from '@/components/common/StatusBadge'
import { cancelConsultation, completeConsultation, decideConsultation } from '../actions'
import { loadConsultationPage } from '../loadConsultationPage'
import type { ConsultationItem } from '../types'
type Status = ConsultationItem['consultation_status']
type Page = {
  items: ConsultationItem[]
  hasMore: boolean
  nextCursor: { createdAt: string; id: string } | null
}
export function ConsultationDirectory({
  initialPage,
  viewer,
  fixedStatus,
}: {
  initialPage: Page
  viewer: 'STUDENT' | 'FACULTY' | 'ADMIN'
  fixedStatus?: Status
}) {
  const [page, setPage] = useState(initialPage)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<Status | ''>(fixedStatus ?? '')
  const [pending, startTransition] = useTransition()
  const marker = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const timeout = setTimeout(
      () =>
        startTransition(async () =>
          setPage(await loadConsultationPage({ search, status: status || null, cursor: null }))
        ),
      300
    )
    return () => clearTimeout(timeout)
  }, [search, status])
  useEffect(() => {
    const node = marker.current
    if (!node || pending || !page.hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && page.nextCursor)
          startTransition(async () => {
            const next = await loadConsultationPage({
              search,
              status: status || null,
              cursor: page.nextCursor,
            })
            setPage((current) => ({ ...next, items: [...current.items, ...next.items] }))
          })
      },
      { rootMargin: '200px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [page, pending, search, status])
  const field = 'grid flex-1 gap-1.5 text-xs font-bold'
  const control =
    'min-h-11 rounded-lg border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus'
  return (
    <>
      <div className="grid items-end gap-3 rounded-xl border border-border bg-surface p-4 sm:flex">
        <label className={field}>
          <span>Search</span>
          <input
            className={control}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search person or purpose"
          />
        </label>
        {!fixedStatus && (
          <label className={field}>
            <span>Status</span>
            <select
              className={control}
              value={status}
              onChange={(event) => setStatus(event.target.value as Status | '')}
            >
              <option value="">All statuses</option>
              {['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        )}
      </div>
      <section className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
        {page.items.length === 0 ? (
          <p className="p-8 text-center text-muted">No consultations found.</p>
        ) : (
          page.items.map((item) => (
            <article
              className="grid items-center gap-4 border-b border-border p-4 last:border-0 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_.8fr_auto]"
              key={item.id}
            >
              <div>
                <strong>{viewer === 'STUDENT' ? item.faculty_name : item.student_name}</strong>
                <p className="mt-1 text-sm text-muted">{item.purpose}</p>
              </div>
              <div>
                <time>{item.slot_date}</time>
                <p className="mt-1 text-sm text-muted">
                  {item.start_time.slice(0, 5)}–{item.end_time.slice(0, 5)}
                </p>
              </div>
              <StatusBadge status={item.consultation_status} />
              <div className="flex gap-2">
                {viewer === 'FACULTY' && item.consultation_status === 'PENDING' && (
                  <>
                    <AlertDialog
                      label="Approve"
                      title="Approve consultation?"
                      description="This confirms the selected schedule."
                      fields={{ consultationId: item.id, approve: 'true' }}
                      submitAction={decideConsultation}
                    />
                    <AlertDialog
                      label="Reject"
                      title="Reject consultation?"
                      description="The slot will reopen."
                      fields={{ consultationId: item.id, approve: 'false' }}
                      submitAction={decideConsultation}
                      variant="danger"
                    />
                  </>
                )}
                {viewer === 'FACULTY' && item.consultation_status === 'APPROVED' && (
                  <AlertDialog
                    label="Complete"
                    title="Complete consultation?"
                    description="This closes the schedule."
                    fields={{ consultationId: item.id }}
                    submitAction={completeConsultation}
                  />
                )}{' '}
                {viewer === 'STUDENT' &&
                  ['PENDING', 'APPROVED'].includes(item.consultation_status) && (
                    <AlertDialog
                      label="Cancel"
                      title="Cancel consultation?"
                      description="The slot will reopen."
                      fields={{ consultationId: item.id }}
                      submitAction={cancelConsultation}
                      variant="danger"
                    />
                  )}
              </div>
            </article>
          ))
        )}
      </section>
      <div
        ref={marker}
        className="grid min-h-12 place-items-center text-sm text-muted"
        aria-live="polite"
      >
        {pending ? 'Loading consultations…' : page.hasMore ? 'Scroll for more' : ''}
      </div>
    </>
  )
}
