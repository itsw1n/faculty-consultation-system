import Link from 'next/link'
import { CalendarPlus } from 'lucide-react'
import { AlertDialog } from '@/components/common/AlertDialog'
import { PageHeading } from '@/components/common/PageHeading'
import { decideConsultation } from '@/features/consultations/actions'
import { categoryLabel } from '@/features/consultations/categories'
import { ConsultationDetailsDialog } from '@/features/consultations/components/ConsultationDetailsDialog'
import type { ConsultationItem } from '@/features/consultations/types'
import { getFacultyDashboard } from '@/features/dashboard/repositories/dashboardRepository'

const dayFormatter = new Intl.DateTimeFormat('en-PH', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'Asia/Manila',
})

const timeFormatter = new Intl.DateTimeFormat('en-PH', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'Asia/Manila',
})

function formatDay(date: string) {
  return dayFormatter.format(new Date(`${date}T00:00:00+08:00`))
}

function formatTimeRange(start: string, end: string) {
  const startDate = new Date(`1970-01-01T${start}+08:00`)
  const endDate = new Date(`1970-01-01T${end}+08:00`)
  return `${timeFormatter.format(startDate)}–${timeFormatter.format(endDate)}`
}

function modeLabel(item: Pick<ConsultationItem, 'mode' | 'location'>) {
  return item.mode === 'IN_PERSON' ? item.location : 'Online'
}

export default async function FacultyDashboard() {
  const { summary, requests, agenda } = await getFacultyDashboard()

  return (
    <>
      <PageHeading
        eyebrow="Faculty workspace"
        title="Faculty Dashboard"
        description="Decide requests and prepare for your next consultations."
        action={
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-focus"
            href="/faculty/availability"
          >
            <CalendarPlus size={18} aria-hidden="true" /> Add availability
          </Link>
        }
      />

      <section
        aria-label="Availability status"
        className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-subtle px-4 py-3 text-sm"
      >
        {summary.open_slots > 0 ? (
          <p>
            <strong className="font-semibold text-primary">
              {summary.open_slots} open slot{summary.open_slots === 1 ? '' : 's'}
            </strong>
            {summary.next_open_date &&
            summary.next_open_start_time &&
            summary.next_open_end_time ? (
              <>
                {' '}
                · Next: {formatDay(summary.next_open_date)}{' '}
                {formatTimeRange(summary.next_open_start_time, summary.next_open_end_time)}
              </>
            ) : null}
          </p>
        ) : (
          <p>
            <strong className="font-semibold text-primary">No open availability.</strong> Students
            cannot request a consultation yet.
          </p>
        )}
        <Link className="font-semibold text-primary hover:underline" href="/faculty/availability">
          Manage availability
        </Link>
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section
          aria-labelledby="pending-heading"
          className="rounded-lg border border-border bg-surface p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="pending-heading" className="text-lg font-semibold text-primary">
                Needs your decision
              </h2>
              <p className="mt-1 text-sm text-muted">
                {summary.pending === 0
                  ? 'No requests waiting.'
                  : `${summary.pending} request${summary.pending === 1 ? '' : 's'} waiting.`}
              </p>
            </div>
            <Link className="font-semibold text-primary hover:underline" href="/faculty/requests">
              View all requests
            </Link>
          </div>
          {requests.length === 0 ? (
            <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
              You&apos;re all caught up.
            </p>
          ) : (
            <ul className="mt-4 list-none divide-y divide-border border-t border-border p-0">
              {requests.map((item) => (
                <li className="py-4" key={item.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <strong className="font-semibold text-primary">{item.student_name}</strong>
                      <p className="mt-1 text-sm text-muted">{categoryLabel(item.purpose)}</p>
                      <p className="mt-1 text-sm text-muted">
                        {formatDay(item.slot_date)} ·{' '}
                        {formatTimeRange(item.start_time, item.end_time)} · {modeLabel(item)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <AlertDialog
                        label="Approve"
                        accessibleLabel={`Approve consultation with ${item.student_name}`}
                        title="Approve consultation?"
                        description="This confirms the selected schedule."
                        fields={{ consultationId: item.id, approve: 'true' }}
                        submitAction={decideConsultation}
                      />
                      <AlertDialog
                        label="Reject"
                        accessibleLabel={`Reject consultation with ${item.student_name}`}
                        title="Reject consultation?"
                        description="The slot will reopen."
                        fields={{ consultationId: item.id, approve: 'false' }}
                        submitAction={decideConsultation}
                        variant="danger"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="agenda-heading"
          className="rounded-lg border border-border bg-surface p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="agenda-heading" className="text-lg font-semibold text-primary">
                Upcoming consultations
              </h2>
              <p className="mt-1 text-sm text-muted">Your next confirmed appointments.</p>
            </div>
            <Link
              className="font-semibold text-primary hover:underline"
              href="/faculty/consultations"
            >
              View all consultations
            </Link>
          </div>
          {agenda.length === 0 ? (
            <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
              No confirmed consultations scheduled.
            </p>
          ) : (
            <ul className="mt-4 list-none divide-y divide-border border-t border-border p-0">
              {agenda.map((item) => (
                <li className="flex flex-wrap items-start justify-between gap-3 py-4" key={item.id}>
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      <time dateTime={item.slot_date}>{formatDay(item.slot_date)}</time> ·{' '}
                      {formatTimeRange(item.start_time, item.end_time)}
                    </p>
                    <strong className="mt-1 block font-semibold">{item.student_name}</strong>
                    <p className="mt-1 text-sm text-muted">{modeLabel(item)}</p>
                  </div>
                  <ConsultationDetailsDialog item={item} viewer="FACULTY" />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
