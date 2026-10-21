'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertDialog } from '@/components/common/AlertDialog'
import { InfiniteListMarker } from '@/components/common/InfiniteListMarker'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Select } from '@/components/common/select/Select'
import { useInfinitePage, type InfinitePage } from '@/lib/useInfinitePage'
import { cancelConsultation, decideConsultation } from '../actions'
import { getConsultationPage } from '../queries/getConsultationPage'
import type { ConsultationItem } from '../types'
import { categoryLabel } from '../categories'

type Status = ConsultationItem['consultation_status']
type Cursor = { createdAt: string; id: string }

export function ConsultationDirectory({
  initialPage,
  viewer,
  fixedStatus,
}: {
  initialPage: InfinitePage<ConsultationItem, Cursor>
  viewer: 'STUDENT' | 'FACULTY' | 'ADMIN'
  fixedStatus?: Status
}) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<Status | ''>(fixedStatus ?? '')
  const { page, pending, markerRef, reload } = useInfinitePage<ConsultationItem, Cursor>({
    initialPage,
    fetchPage: (cursor) => getConsultationPage({ search, status: status || null, cursor }),
  })
  useEffect(() => {
    const timeout = setTimeout(
      () => reload(() => getConsultationPage({ search, status: status || null, cursor: null })),
      300
    )
    return () => clearTimeout(timeout)
  }, [search, status, reload])
  const field = 'grid flex-1 gap-1.5 text-xs font-semibold'
  const control =
    'min-h-11 rounded-md border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus'
  return (
    <>
      <div className="grid items-end gap-3 border-y border-border py-4 sm:flex">
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
          <Select
            label="Status"
            options={[
              { id: 'all', label: 'All statuses' },
              ...['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].map((value) => ({
                id: value,
                label: value.charAt(0) + value.slice(1).toLowerCase(),
              })),
            ]}
            value={status || 'all'}
            onChange={(value) => setStatus(value === 'all' ? '' : (value as Status | ''))}
          />
        )}
      </div>
      <section className="mt-5 overflow-hidden rounded-lg border border-border bg-surface">
        <div className="hidden grid-cols-[2fr_1fr_.8fr_auto] gap-4 border-b border-border bg-background px-4 py-3 text-xs font-semibold tracking-wide text-muted uppercase lg:grid">
          <span>{viewer === 'STUDENT' ? 'Faculty' : 'Student'}</span>
          <span>Schedule</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {page.items.length === 0 ? (
          <p className="p-8 text-center text-muted">No consultations found.</p>
        ) : (
          page.items.map((item) => (
            <article
              className="grid items-center gap-4 border-b border-border p-4 last:border-0 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_.8fr_auto]"
              key={item.id}
            >
              <div>
                <strong className="font-semibold text-primary">
                  {viewer === 'STUDENT' ? item.faculty_name : item.student_name}
                </strong>
                <p className="mt-1 text-sm text-muted">{categoryLabel(item.purpose)}</p>
              </div>
              <div className="text-sm">
                <span className="mb-1 block text-xs font-semibold text-foreground lg:hidden">
                  Schedule
                </span>
                <time>{item.slot_date}</time>
                <p className="mt-1 text-sm text-muted">
                  {item.start_time.slice(0, 5)}–{item.end_time.slice(0, 5)}
                </p>
              </div>
              <div>
                <span className="mb-1 block text-xs font-semibold text-foreground lg:hidden">
                  Status
                </span>
                <StatusBadge status={item.consultation_status} />
              </div>
              <div className="flex gap-2">
                {viewer !== 'ADMIN' && (
                  <Link
                    className="font-bold text-primary underline"
                    href={`/${viewer.toLowerCase()}/consultations/${item.id}`}
                  >
                    Details
                  </Link>
                )}
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
                  <Link
                    className="font-bold text-primary underline"
                    href={`/faculty/consultations/${item.id}`}
                  >
                    Complete
                  </Link>
                )}
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
      <InfiniteListMarker
        markerRef={markerRef}
        pending={pending}
        hasMore={page.hasMore}
        pendingLabel="Loading consultations…"
      />
    </>
  )
}
