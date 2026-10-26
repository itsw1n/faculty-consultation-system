'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Cell, Column, Row, TableBody, TableHeader } from 'react-aria-components'
import { SearchInput } from '@/components/common/SearchInput'
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

const STATUS_VALUES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'] as const

function statusFromSearchParams(values: string[]): Status | '' {
  if (values.length !== 1) return 'PENDING'
  const value = values[0]
  if (value === 'all') return ''
  if ((STATUS_VALUES as readonly string[]).includes(value)) return value as Status
  return 'PENDING'
}

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'Asia/Manila',
})

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00+08:00`))
}

const timeFormatter = new Intl.DateTimeFormat('en-PH', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'Asia/Manila',
})

function formatTime(time: string) {
  return timeFormatter.format(new Date(`1970-01-01T${time}+08:00`))
}

export function ConsultationDirectory({
  initialPage,
  viewer,
  initialStatus,
  statusInUrl = false,
  allowDecisions = false,
}: {
  initialPage: InfinitePage<ConsultationItem, Cursor>
  viewer: 'STUDENT' | 'FACULTY' | 'ADMIN'
  initialStatus?: Status
  statusInUrl?: boolean
  allowDecisions?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [localStatus, setLocalStatus] = useState<Status | ''>(initialStatus ?? '')
  const status = statusInUrl ? statusFromSearchParams(searchParams.getAll('status')) : localStatus
  const pendingRequestView = allowDecisions && status === 'PENDING'
  const initialStatusValue = useRef<Status | ''>(initialStatus ?? '')
  const isFirstRender = useRef(true)
  const { page, setPage, pending, error, retry, markerRef, reload } = useInfinitePage<
    ConsultationItem,
    Cursor
  >({
    initialPage,
    fetchPage: (cursor) => getConsultationPage({ search, status: status || null, cursor }),
  })
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      if (!statusInUrl || initialStatusValue.current === status) return
    }
    const timeout = setTimeout(
      () => reload(() => getConsultationPage({ search, status: status || null, cursor: null })),
      300
    )
    return () => clearTimeout(timeout)
  }, [search, status, reload, statusInUrl])
  const changeStatus = (value: string) => {
    const next = value === 'all' ? '' : (value as Status | '')
    if (statusInUrl) {
      const params = new URLSearchParams(window.location.search)
      params.set('status', next || 'all')
      window.history.replaceState(null, '', `${pathname}?${params}${window.location.hash}`)
      return
    }
    setLocalStatus(next)
  }
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
  return (
    <div
      data-faculty-list={viewer === 'FACULTY' ? 'consultations' : undefined}
      data-student-list={viewer === 'STUDENT' ? '' : undefined}
      data-admin-list={viewer === 'ADMIN' ? 'records' : undefined}
    >
      <div className="grid items-end gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <SearchInput
          label="Search"
          value={search}
          onChange={setSearch}
          placeholder={
            viewer === 'STUDENT'
              ? 'Search faculty name or category...'
              : 'Search student name or category...'
          }
        />
        <Select
          label="Status"
          options={[
            { id: 'all', label: 'All statuses' },
            ...STATUS_VALUES.map((value) => ({
              id: value,
              label: value.charAt(0) + value.slice(1).toLowerCase(),
            })),
          ]}
          value={status || 'all'}
          onChange={changeStatus}
        />
      </div>
      <div className="mt-5" aria-busy={pending}>
        <p className="mb-3 text-xs text-muted" role="status">
          {pending
            ? 'Updating consultations…'
            : `${page.items.length}${page.hasMore ? '+' : ''} consultation${page.items.length === 1 ? '' : 's'}${pendingRequestView ? ' awaiting your decision' : ''}`}
        </p>
        <DataTable aria-label="Consultations">
          <TableHeader className="border-b border-border bg-background text-xs font-semibold tracking-wide text-muted uppercase">
            <Column isRowHeader className="w-[22%] px-5 py-3">
              {viewer === 'STUDENT' ? 'Faculty' : 'Student'}
            </Column>
            {viewer === 'ADMIN' && <Column className="w-[26%] px-5 py-3">Faculty</Column>}
            <Column className={viewer === 'ADMIN' ? 'w-[20%] px-5 py-3' : 'w-[16%] px-5 py-3'}>
              Schedule
            </Column>
            <Column className="w-[16%] px-5 py-3">Category</Column>
            <Column className="w-[12%] px-5 py-3">Status</Column>
            {viewer !== 'ADMIN' && <Column className="w-[34%] px-5 py-3 text-right">Action</Column>}
          </TableHeader>
          <TableBody
            items={page.items}
            renderEmptyState={() =>
              viewer !== 'ADMIN' ? (
                <div className="px-5 py-8 text-center">
                  <p className="font-medium text-foreground">No consultations found.</p>
                  <p className="mt-1 text-sm text-muted">
                    {search || (status && !pendingRequestView)
                      ? 'Try another search or status.'
                      : allowDecisions
                        ? 'New requests will appear here when students book your availability.'
                        : viewer === 'STUDENT'
                          ? 'Book a consultation to start your consultation history.'
                          : 'Your consultation records will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="px-5 py-8 text-center">
                  <p className="font-medium text-foreground">No consultations found.</p>
                  <p className="mt-1 text-sm text-muted">
                    Try another student name, category, or status.
                  </p>
                </div>
              )
            }
          >
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
                {viewer === 'ADMIN' && (
                  <Cell data-label="Faculty" className="px-5 py-4">
                    <strong className="font-medium text-foreground">{item.faculty_name}</strong>
                    <p className="mt-1 text-xs text-muted">{item.faculty_department ?? '—'}</p>
                  </Cell>
                )}
                <Cell data-label="Schedule" className="px-5 py-4 text-sm text-muted">
                  <time dateTime={item.slot_date}>{formatDate(item.slot_date)}</time>
                  <p className="mt-1">
                    {formatTime(item.start_time)}–{formatTime(item.end_time)}
                  </p>
                </Cell>
                <Cell data-label="Category" className="px-5 py-4 text-sm text-muted">
                  {categoryLabel(item.category)}
                </Cell>
                <Cell data-label="Status" className="px-5 py-4">
                  <StatusBadge status={item.consultation_status} />
                </Cell>
                {viewer !== 'ADMIN' && (
                  <Cell data-label="Actions" className="px-5 py-4">
                    <div className="flex flex-nowrap items-center justify-end gap-1.5">
                      <ConsultationDetailsDialog
                        item={item}
                        viewer={viewer}
                        onCompleted={viewer === 'FACULTY' ? handleCompleted : undefined}
                      />
                      {allowDecisions &&
                        viewer === 'FACULTY' &&
                        item.consultation_status === 'PENDING' && (
                          <>
                            <AlertDialog
                              label="Approve"
                              accessibleLabel={`Approve consultation with ${item.student_name}`}
                              title="Approve consultation?"
                              description="This confirms the selected schedule."
                              fields={{ consultationId: item.id, approve: 'true' }}
                              submitAction={decideConsultation}
                              onSuccess={refreshList}
                            />
                            <AlertDialog
                              label="Reject"
                              accessibleLabel={`Reject consultation with ${item.student_name}`}
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
                )}
              </Row>
            )}
          </TableBody>
        </DataTable>
      </div>
      <InfiniteListMarker
        markerRef={markerRef}
        error={error}
        onRetry={retry}
        pending={pending}
        hasMore={page.hasMore}
        pendingLabel="Loading consultations…"
      />
    </div>
  )
}
