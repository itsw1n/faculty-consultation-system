'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { ConfirmAction } from '@/components/common/ConfirmAction'
import { StatusBadge } from '@/components/common/StatusBadge'
import { reviewApplication, reviewApplications } from '../actions'
import { loadApplicationPage } from '../loadApplicationPage'
import type { ApplicationItem } from '../repositories/applicationRepository'

type Page = {
  items: ApplicationItem[]
  hasMore: boolean
  nextCursor: { createdAt: string; id: string } | null
}

type Filters = { search: string; status: string; role: string; department: string }

export function ApplicationReviewList({
  initialPage,
  filters,
}: {
  initialPage: Page
  filters: Filters
}) {
  const [page, setPage] = useState(initialPage)
  const [selected, setSelected] = useState<string[]>([])
  const [pending, startTransition] = useTransition()
  const marker = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = marker.current
    if (!node || pending || !page.hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && page.nextCursor) {
          startTransition(async () => {
            const next = await loadApplicationPage({
              search: filters.search,
              status: filters.status || null,
              role: filters.role || null,
              department: filters.department || null,
              cursor: page.nextCursor,
            })
            setPage((current) => ({ ...next, items: [...current.items, ...next.items] }))
          })
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [page, pending, filters])

  function toggleSelection(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]
    )
  }

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <span className="mr-auto text-sm text-muted">
          {selected.length ? `${selected.length} selected` : 'Select pending applications below'}
        </span>
        <ConfirmAction
          label="Approve selected"
          title="Approve selected applications?"
          description="The selected applicants will gain access using their requested roles."
          fields={{ userIds: selected, decision: 'APPROVED' }}
          submitAction={reviewApplications}
          disabled={selected.length === 0}
        />
        <ConfirmAction
          label="Reject selected"
          title="Reject selected applications?"
          description="The selected applicants will not be able to access the system."
          fields={{ userIds: selected, decision: 'REJECTED' }}
          submitAction={reviewApplications}
          variant="danger"
          disabled={selected.length === 0}
        />
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
        {page.items.length === 0 ? (
          <p className="p-8 text-center text-muted">No applications match these filters.</p>
        ) : (
          page.items.map((application) => (
            <article
              className="grid items-center gap-4 border-b border-border p-4 last:border-0 sm:grid-cols-[auto_2fr_1fr_auto]"
              key={application.id}
            >
              {application.account_status === 'PENDING' ? (
                <input
                  aria-label={`Select ${application.full_name}`}
                  type="checkbox"
                  checked={selected.includes(application.id)}
                  onChange={() => toggleSelection(application.id)}
                />
              ) : (
                <span />
              )}
              <div>
                <strong>{application.full_name}</strong>
                <p className="mt-1 text-sm text-muted">{application.email}</p>
              </div>
              <div>
                <StatusBadge status={application.requested_role ?? application.account_status} />
                <p className="mt-1 text-sm text-muted">
                  {application.department_name ?? 'No department'}
                </p>
              </div>
              {application.account_status === 'PENDING' && (
                <div className="flex gap-2">
                  <ConfirmAction
                    label="Approve"
                    title={`Approve ${application.full_name}?`}
                    description="This applicant will gain access using the requested role."
                    fields={{ userId: application.id, decision: 'APPROVED' }}
                    submitAction={reviewApplication}
                  />
                  <ConfirmAction
                    label="Reject"
                    title={`Reject ${application.full_name}?`}
                    description="This applicant will not be able to access the system."
                    fields={{ userId: application.id, decision: 'REJECTED' }}
                    submitAction={reviewApplication}
                    variant="danger"
                  />
                </div>
              )}
            </article>
          ))
        )}
      </div>
      <div
        ref={marker}
        className="grid min-h-12 place-items-center text-sm text-muted"
        aria-live="polite"
      >
        {pending ? 'Loading applications…' : page.hasMore ? 'Scroll for more' : ''}
      </div>
    </>
  )
}
