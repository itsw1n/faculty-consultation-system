'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cell, Column, Row, TableBody, TableHeader } from 'react-aria-components'
import { Button } from '@/components/common/button/Button'
import { DataTable } from '@/components/common/table/DataTable'
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
  const { page, pending, markerRef } = useInfinitePage<ApplicationItem, Cursor>({
    initialPage,
    fetchPage: (cursor) =>
      getApplicationPage({
        search: filters.search,
        role: filters.role || null,
        department: filters.department || null,
        cursor,
      }),
  })

  return (
    <>
      {message ? (
        <p className="mt-4 text-sm font-semibold text-success" role="status">
          {message}
        </p>
      ) : null}
      <div className="mt-5">
        <DataTable aria-label="User accounts">
          <TableHeader className="border-b border-border bg-background text-xs font-semibold tracking-wide text-muted uppercase">
            <Column isRowHeader className="w-[34%] px-5 py-3">
              User
            </Column>
            <Column className="w-[22%] px-5 py-3">Department</Column>
            <Column className="w-[17%] px-5 py-3">Position</Column>
            <Column className="w-[12%] px-5 py-3">Role</Column>
            <Column className="w-[15%] px-5 py-3 text-right">Action</Column>
          </TableHeader>
          <TableBody items={page.items} renderEmptyState={() => 'No accounts match these filters.'}>
            {(application) => (
              <Row className="border-b border-border last:border-0 data-[focus-visible-within]:outline-3 data-[focus-visible-within]:outline-focus">
                <Cell className="px-5 py-4 align-middle">
                  <strong className="font-semibold text-primary">{application.full_name}</strong>
                  <p className="mt-1 text-sm text-muted">{application.email}</p>
                </Cell>
                <Cell className="px-5 py-4 text-sm text-muted">
                  {application.department_name ?? '—'}
                </Cell>
                <Cell className="px-5 py-4 text-sm text-muted">
                  {application.role === 'FACULTY' ? (application.position_title ?? '—') : '—'}
                </Cell>
                <Cell className="px-5 py-4">
                  <StatusBadge status={application.role} />
                </Cell>
                <Cell className="px-5 py-4 text-right">
                  {application.role !== 'ADMIN' ? (
                    <Button
                      variant="secondary"
                      onPress={() => {
                        setMessage('')
                        setCorrectTarget(application)
                      }}
                    >
                      Edit User
                    </Button>
                  ) : null}
                </Cell>
              </Row>
            )}
          </TableBody>
        </DataTable>
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
