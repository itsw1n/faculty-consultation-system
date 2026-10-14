'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { AlertDialog } from '@/components/common/AlertDialog'
import { Button } from '@/components/common/button/Button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { SubmitButton } from '@/components/common/SubmitButton'
import { Modal } from '@/components/common/modal/Modal'
import { Select } from '@/components/common/select/Select'
import { initialActionState } from '@/lib/actionState'
import { correctUserAccount, reviewApplication, reviewApplications } from '../actions'
import { getApplicationPage } from '../queries/getApplicationPage'
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
  departments,
}: {
  initialPage: Page
  filters: Filters
  departments: { id: string; name: string }[]
}) {
  const [page, setPage] = useState(initialPage)
  const [selected, setSelected] = useState<string[]>([])
  const [correctTarget, setCorrectTarget] = useState<ApplicationItem | null>(null)
  const [correctRole, setCorrectRole] = useState('STUDENT')
  const [correctionState, correctionAction] = useActionState(correctUserAccount, initialActionState)
  const [pending, startTransition] = useTransition()
  const marker = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = marker.current
    if (!node || pending || !page.hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && page.nextCursor) {
          startTransition(async () => {
            const next = await getApplicationPage({
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
        <AlertDialog
          label="Approve selected"
          title="Approve selected applications?"
          description="The selected applicants will gain access using their requested roles."
          fields={{ userIds: selected, decision: 'APPROVED' }}
          submitAction={reviewApplications}
          disabled={selected.length === 0}
        />
        <AlertDialog
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
                  <AlertDialog
                    label="Approve"
                    title={`Approve ${application.full_name}?`}
                    description="This applicant will gain access using the requested role."
                    fields={{ userId: application.id, decision: 'APPROVED' }}
                    submitAction={reviewApplication}
                  />
                  <AlertDialog
                    label="Reject"
                    title={`Reject ${application.full_name}?`}
                    description="This applicant will not be able to access the system."
                    fields={{ userId: application.id, decision: 'REJECTED' }}
                    submitAction={reviewApplication}
                    variant="danger"
                  />
                </div>
              )}
              {application.account_status === 'APPROVED' && (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onPress={() => {
                      setCorrectTarget(application)
                      setCorrectRole(application.role ?? 'STUDENT')
                    }}
                  >
                    Correct
                  </Button>
                </div>
              )}
            </article>
          ))
        )}
      </div>
      <Modal
        title="Correct account"
        isOpen={correctTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCorrectTarget(null)
        }}
        className="max-w-3xl"
      >
        {correctTarget ? (
          <form key={correctTarget.id} action={correctionAction} className="mt-6 grid gap-3">
            <p className="text-muted">
              Fix {correctTarget.full_name}&apos;s role or department. A position title is only
              needed when making someone faculty for the first time.
            </p>
            <input type="hidden" name="userId" value={correctTarget.id} />
            <Select
              label="Role"
              name="role"
              options={[
                { id: 'STUDENT', label: 'Student' },
                { id: 'FACULTY', label: 'Faculty' },
              ]}
              defaultValue={correctTarget.role ?? 'STUDENT'}
              onChange={setCorrectRole}
              isRequired
            />
            <Select
              label="Department"
              name="departmentId"
              options={departments.map((department) => ({
                id: department.id,
                label: department.name,
              }))}
              defaultValue={correctTarget.department_id ?? ''}
              placeholder="Select a department"
              isRequired
            />
            {correctRole === 'FACULTY' && (
              <label className="grid gap-1.5 text-xs font-bold">
                Position title (leave blank to keep current)
                <input
                  className="min-h-11 rounded-lg border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus"
                  name="positionTitle"
                  maxLength={120}
                  placeholder="Leave blank to keep current"
                />
              </label>
            )}
            <p className="min-h-5 text-sm font-semibold text-danger" role="alert">
              {correctionState.error}
            </p>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onPress={() => setCorrectTarget(null)}>
                Cancel
              </Button>
              <SubmitButton pendingLabel="Saving…">Save correction</SubmitButton>
            </div>
          </form>
        ) : null}
      </Modal>
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
