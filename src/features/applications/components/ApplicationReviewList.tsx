'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/common/button/Button'
import { InfiniteListMarker } from '@/components/common/InfiniteListMarker'
import { StatusBadge } from '@/components/common/StatusBadge'
import { SubmitButton } from '@/components/common/SubmitButton'
import { Modal } from '@/components/common/modal/Modal'
import { Select } from '@/components/common/select/Select'
import { initialActionState } from '@/lib/actionState'
import { useInfinitePage, type InfinitePage } from '@/lib/useInfinitePage'
import { correctUserAccount } from '../actions'
import { getApplicationPage } from '../queries/getApplicationPage'
import type { ApplicationItem } from '../types'

type Cursor = { createdAt: string; id: string }

type Filters = { search: string; role: string; department: string }

function EditUserForm({
  target,
  departments,
  onSuccess,
  onCancel,
}: {
  target: ApplicationItem
  departments: { id: string; name: string }[]
  onSuccess: (message: string) => void
  onCancel: () => void
}) {
  const [role, setRole] = useState<string>(target.role ?? 'STUDENT')
  const [state, action] = useActionState(correctUserAccount, initialActionState)

  useEffect(() => {
    if (state.message) onSuccess(state.message)
  }, [state.message, onSuccess])

  return (
    <form action={action} className="mt-6 grid gap-3">
      <p className="text-muted">Update {target.full_name}&apos;s role or department.</p>
      <input type="hidden" name="userId" value={target.id} />
      <Select
        label="Role"
        name="role"
        options={[
          { id: 'STUDENT', label: 'Student' },
          { id: 'FACULTY', label: 'Faculty' },
        ]}
        defaultValue={target.role ?? 'STUDENT'}
        onChange={setRole}
        isRequired
      />
      <Select
        label="Department"
        name="departmentId"
        options={departments.map((department) => ({ id: department.id, label: department.name }))}
        defaultValue={target.department_id ?? ''}
        placeholder="Select a department"
        isRequired
      />
      {role === 'FACULTY' ? (
        <label className="grid gap-1.5 text-xs font-bold">
          Position title {target.role === 'FACULTY' ? '(leave blank to keep current)' : ''}
          <input
            className="min-h-11 rounded-lg border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus"
            name="positionTitle"
            required={target.role !== 'FACULTY'}
            maxLength={120}
            placeholder={
              target.role === 'FACULTY' ? 'Leave blank to keep current' : 'e.g. Instructor'
            }
          />
        </label>
      ) : null}
      {state.error ? (
        <p className="text-sm font-semibold text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onPress={onCancel}>
          Cancel
        </Button>
        <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
      </div>
    </form>
  )
}

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
  const [message, setMessage] = useState('')
  const router = useRouter()
  const { page, setPage, pending, markerRef } = useInfinitePage<ApplicationItem, Cursor>({
    initialPage,
    fetchPage: (cursor) =>
      getApplicationPage({
        search: filters.search,
        role: filters.role || null,
        department: filters.department || null,
        cursor,
      }),
  })

  useEffect(() => setPage(initialPage), [initialPage, setPage])

  return (
    <>
      {message ? (
        <p className="mt-4 text-sm font-semibold text-success" role="status">
          {message}
        </p>
      ) : null}
      <div className="mt-5 overflow-hidden rounded-lg border border-border bg-surface">
        <div className="hidden grid-cols-[minmax(17rem,2fr)_minmax(11rem,1.2fr)_minmax(8rem,1fr)_minmax(6rem,0.65fr)_auto] gap-4 border-b border-border bg-background px-5 py-3 text-xs font-semibold tracking-wide text-muted uppercase md:grid">
          <span>User</span>
          <span>Department</span>
          <span>Position</span>
          <span>Role</span>
          <span>Action</span>
        </div>
        {page.items.length === 0 ? (
          <p className="p-8 text-center text-muted">No accounts match these filters.</p>
        ) : (
          page.items.map((application) => (
            <article
              className="grid items-center gap-4 border-b border-border px-5 py-4 last:border-0 md:grid-cols-[minmax(17rem,2fr)_minmax(11rem,1.2fr)_minmax(8rem,1fr)_minmax(6rem,0.65fr)_auto]"
              key={application.id}
            >
              <div>
                <strong>{application.full_name}</strong>
                <p className="mt-1 text-sm text-muted">{application.email}</p>
              </div>
              <p className="text-sm text-muted">
                <span className="mb-1 block text-xs font-semibold text-foreground md:hidden">
                  Department
                </span>
                {application.department_name ?? '—'}
              </p>
              <p className="text-sm text-muted">
                <span className="mb-1 block text-xs font-semibold text-foreground md:hidden">
                  Position
                </span>
                {application.role === 'FACULTY' ? (application.position_title ?? '—') : '—'}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-full text-xs font-semibold text-foreground md:hidden">Role</span>
                <StatusBadge status={application.role} />
              </div>
              {application.role !== 'ADMIN' ? (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onPress={() => {
                      setMessage('')
                      setCorrectTarget(application)
                    }}
                  >
                    Edit User
                  </Button>
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
      <Modal
        title="Edit User"
        isOpen={correctTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCorrectTarget(null)
        }}
        className="max-w-3xl"
      >
        {correctTarget ? (
          <EditUserForm
            key={correctTarget.id}
            target={correctTarget}
            departments={departments}
            onCancel={() => setCorrectTarget(null)}
            onSuccess={(successMessage) => {
              setMessage(successMessage)
              setCorrectTarget(null)
              router.refresh()
            }}
          />
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
