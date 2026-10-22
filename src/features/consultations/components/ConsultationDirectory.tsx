'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cell, Column, Row, TableBody, TableHeader } from 'react-aria-components'
import { AlertDialog } from '@/components/common/AlertDialog'
import { DataTable } from '@/components/common/table/DataTable'
import { InfiniteListMarker } from '@/components/common/InfiniteListMarker'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Select } from '@/components/common/select/Select'
import { useInfinitePage, type InfinitePage } from '@/lib/useInfinitePage'
import { cancelConsultation, decideConsultation } from '../actions'
import { getConsultationPage } from '../queries/getConsultationPage'
import type { ConsultationItem } from '../types'
import { categoryLabel } from '../categories'
import { ConsultationDetailsDialog } from './ConsultationDetailsDialog'

type Status = ConsultationItem['consultation_status']
type Cursor = { createdAt: string; id: string }

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'Asia/Manila',
})

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00+08:00`))
}

export function ConsultationDirectory({
  initialPage,
  viewer,
  fixedStatus,
  allowDecisions = false,
}: {
  initialPage: InfinitePage<ConsultationItem, Cursor>
  viewer: 'STUDENT' | 'FACULTY' | 'ADMIN'
  fixedStatus?: Status
  allowDecisions?: boolean
}) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<Status | ''>(fixedStatus ?? '')
  const isFirstRender = useRef(true)
  const { page, setPage, pending, markerRef, reload } = useInfinitePage<ConsultationItem, Cursor>({
    initialPage,
    fetchPage: (cursor) => getConsultationPage({ search, status: status || null, cursor }),
  })
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timeout = setTimeout(
      () => reload(() => getConsultationPage({ search, status: status || null, cursor: null })),
      300
    )
    return () => clearTimeout(timeout)
  }, [search, status, reload])
  const handleCompleted = (id: string, outcome: string | null) => {
    setPage((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id ? { ...item, consultation_status: 'COMPLETED', outcome } : item
      ),
    }))
    router.refresh()
  }
  const refreshList = () => {
    router.refresh()
    reload(() => getConsultationPage({ search, status: status || null, cursor: null }))
  }
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
            placeholder={
              viewer === 'STUDENT'
                ? 'Search faculty name or purpose...'
                : 'Search student name or purpose...'
            }
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
      <div className="mt-5">
        <DataTable aria-label="Consultations">
          <TableHeader className="border-b border-border bg-background text-xs font-semibold tracking-wide text-muted uppercase">
            <Column isRowHeader className="w-[22%] px-5 py-3">
              {viewer === 'STUDENT' ? 'Faculty' : 'Student'}
            </Column>
            <Column className="w-[16%] px-5 py-3">Schedule</Column>
            <Column className="w-[16%] px-5 py-3">Purpose</Column>
            <Column className="w-[12%] px-5 py-3">Status</Column>
            <Column className="w-[34%] px-5 py-3 text-right">Action</Column>
          </TableHeader>
          <TableBody items={page.items} renderEmptyState={() => 'No consultations found.'}>
            {(item) => (
              <Row className="border-b border-border last:border-0 data-[focus-visible-within]:outline-3 data-[focus-visible-within]:outline-focus">
                <Cell className="px-5 py-4 align-middle">
                  <strong className="font-semibold text-primary">
                    {viewer === 'STUDENT' ? item.faculty_name : item.student_name}
                  </strong>
                  <p className="mt-1 text-sm text-muted">
                    {viewer === 'STUDENT' ? item.faculty_department : item.student_department}
                  </p>
                </Cell>
                <Cell className="px-5 py-4 text-sm text-muted">
                  <time dateTime={item.slot_date}>{formatDate(item.slot_date)}</time>
                  <p className="mt-1">
                    {item.start_time.slice(0, 5)}–{item.end_time.slice(0, 5)}
                  </p>
                </Cell>
                <Cell className="px-5 py-4 text-sm text-muted">{categoryLabel(item.purpose)}</Cell>
                <Cell className="px-5 py-4">
                  <StatusBadge status={item.consultation_status} />
                </Cell>
                <Cell className="px-5 py-4">
                  <div className="flex flex-nowrap items-center justify-end gap-1.5">
                    {viewer !== 'ADMIN' && (
                      <ConsultationDetailsDialog
                        item={item}
                        viewer={viewer}
                        onCompleted={viewer === 'FACULTY' ? handleCompleted : undefined}
                      />
                    )}
                    {allowDecisions &&
                      viewer === 'FACULTY' &&
                      item.consultation_status === 'PENDING' && (
                        <>
                          <AlertDialog
                            label="Approve"
                            title="Approve consultation?"
                            description="This confirms the selected schedule."
                            fields={{ consultationId: item.id, approve: 'true' }}
                            submitAction={decideConsultation}
                            onSuccess={refreshList}
                          />
                          <AlertDialog
                            label="Reject"
                            title="Reject consultation?"
                            description="The slot will reopen."
                            fields={{ consultationId: item.id, approve: 'false' }}
                            submitAction={decideConsultation}
                            variant="danger"
                            onSuccess={refreshList}
                          />
                        </>
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
                          onSuccess={refreshList}
                        />
                      )}
                  </div>
                </Cell>
              </Row>
            )}
          </TableBody>
        </DataTable>
      </div>
      <InfiniteListMarker
        markerRef={markerRef}
        pending={pending}
        hasMore={page.hasMore}
        pendingLabel="Loading consultations…"
      />
    </>
  )
}
