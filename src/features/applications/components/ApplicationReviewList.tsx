'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/common/button/Button'
import { InfiniteListMarker } from '@/components/common/InfiniteListMarker'
import { StatusBadge } from '@/components/common/StatusBadge'
import { SubmitButton } from '@/components/common/SubmitButton'
import { Modal } from '@/components/common/modal/Modal'
import { Select } from '@/components/common/select/Select'
import { initialActionState } from '@/lib/actionState'
import { useInfinitePage, type InfinitePage } from '@/lib/useInfinitePage'
import { correctUserAccount, inviteFaculty, type InviteResult } from '../actions'
import { getApplicationPage } from '../queries/getApplicationPage'
import type { ApplicationItem } from '../types'

type Cursor = { createdAt: string; id: string }

type Filters = { search: string; status: string; role: string; department: string }

export function ApplicationReviewList({
  initialPage,
  filters,
  departments,
}: {
  initialPage: InfinitePage<ApplicationItem, Cursor>
  filters: Filters
  departments: { id: string; name: string }[]
}) {
  const [correctTarget, setCorrectTarget] = useState<ApplicationItem | null>(null)
  const [correctRole, setCorrectRole] = useState('STUDENT')
  const [correctionState, correctionAction] = useActionState(correctUserAccount, initialActionState)
  const [inviteState, inviteAction] = useActionState(inviteFaculty, {
    ...initialActionState,
    results: [] as InviteResult[],
  })
  const inviteResults: InviteResult[] = inviteState.results ?? []
  const { page, pending, markerRef } = useInfinitePage<ApplicationItem, Cursor>({
    initialPage,
    fetchPage: (cursor) =>
      getApplicationPage({
        search: filters.search,
        status: filters.status || null,
        role: filters.role || null,
        department: filters.department || null,
        cursor,
      }),
  })

  return (
    <>
      <section
        aria-label="Invite faculty"
        className="mt-4 rounded-xl border border-border bg-surface p-4"
      >
        <h2 className="text-lg font-bold">Invite faculty</h2>
        <p className="mt-1 text-sm text-muted">
          Add school emails below. Each address becomes approved faculty the first time its owner
          signs in.
        </p>
        <form action={inviteAction} className="mt-3 grid gap-3">
          <label className="grid gap-1.5 text-xs font-bold">
            School emails (one per line or comma-separated)
            <textarea
              className="min-h-24 rounded-lg border border-border bg-surface px-3 py-2 outline-none focus-visible:ring-3 focus-visible:ring-focus"
              name="emails"
              required
              placeholder={'cruz@acdeducation.com\nsantos@acdeducation.com'}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Department"
              name="departmentId"
              options={departments.map((department) => ({
                id: department.id,
                label: department.name,
              }))}
              placeholder="Select a department"
              isRequired
            />
            <label className="grid gap-1.5 text-xs font-bold">
              Position title
              <input
                className="min-h-11 rounded-lg border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus"
                name="positionTitle"
                required
                maxLength={120}
                placeholder="e.g. Instructor"
              />
            </label>
          </div>
          <p className="min-h-5 text-sm font-semibold text-danger" role="alert">
            {inviteState.error}
          </p>
          {inviteResults.length > 0 && (
            <ul className="grid gap-1 text-sm" aria-live="polite">
              {inviteResults.map((result) => (
                <li key={result.email} className="font-semibold">
                  {result.email} — {result.invited ? 'invited' : (result.reason ?? 'skipped')}
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-end">
            <SubmitButton pendingLabel="Inviting…" className="sm:w-auto sm:px-6">
              Invite faculty
            </SubmitButton>
          </div>
        </form>
      </section>
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
        {page.items.length === 0 ? (
          <p className="p-8 text-center text-muted">No accounts match these filters.</p>
        ) : (
          page.items.map((application) => (
            <article
              className="grid items-center gap-4 border-b border-border p-4 last:border-0 sm:grid-cols-[2fr_1fr_auto]"
              key={application.id}
            >
              <div>
                <strong>{application.full_name}</strong>
                <p className="mt-1 text-sm text-muted">{application.email}</p>
              </div>
              <div>
                <StatusBadge status={application.role ?? application.account_status} />
                <p className="mt-1 text-sm text-muted">
                  {application.department_name ?? 'No department'}
                </p>
              </div>
              {application.account_status === 'APPROVED' ? (
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
              ) : (
                <div>
                  <StatusBadge status={application.account_status} />
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
      <InfiniteListMarker
        markerRef={markerRef}
        pending={pending}
        hasMore={page.hasMore}
        pendingLabel="Loading accounts…"
      />
    </>
  )
}
