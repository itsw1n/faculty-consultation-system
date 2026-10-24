import Link from 'next/link'
import { ArrowUpRight, CalendarDays, CalendarPlus, Clock3, Inbox, MapPin } from 'lucide-react'
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
        description="A clear view of your requests, schedule, and availability."
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
        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface px-5 py-4 text-sm"
      >
        <div className="flex items-center gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-subtle text-primary">
            <CalendarDays size={19} aria-hidden="true" />
          </span>
          {summary.open_slots > 0 ? (
            <p className="grid gap-0.5">
              <strong className="font-semibold text-primary">
                {summary.open_slots} open slot{summary.open_slots === 1 ? '' : 's'}
              </strong>
              {summary.next_open_date &&
              summary.next_open_start_time &&
              summary.next_open_end_time ? (
                <>
                  <span className="text-xs text-muted">
                    Next available: {formatDay(summary.next_open_date)}{' '}
                    {formatTimeRange(summary.next_open_start_time, summary.next_open_end_time)}
                  </span>
                </>
              ) : null}
            </p>
          ) : (
            <p>
              <strong className="font-semibold text-primary">No open availability.</strong> Students
              cannot request a consultation yet.
            </p>
          )}
        </div>
        <Link
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
          href="/faculty/availability"
        >
          Manage availability <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] xl:items-start">
        <section
          aria-labelledby="pending-heading"
          className="overflow-hidden rounded-xl border border-border bg-surface"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 bg-background/40 px-5 pt-5 pb-4">
            <div>
              <h2
                id="pending-heading"
                className="flex items-center gap-2 text-base font-semibold text-foreground"
              >
                <Inbox size={17} className="text-muted" aria-hidden="true" /> Needs your decision{' '}
                <span className="ml-1 rounded-md bg-warning/10 px-2 py-0.5 text-xs text-warning">
                  {summary.pending}
                </span>
              </h2>
              <p className="mt-1 text-sm text-muted">
                {summary.pending === 0
                  ? 'No requests waiting.'
                  : `${summary.pending} request${summary.pending === 1 ? '' : 's'} waiting.`}
              </p>
            </div>
            <Link
              className="text-xs font-medium text-primary hover:underline"
              href="/faculty/requests"
            >
              View all requests
            </Link>
          </div>
          {requests.length === 0 ? (
            <p className="m-5 rounded-lg bg-background px-4 py-8 text-center text-sm text-muted">
              You&apos;re all caught up.
            </p>
          ) : (
            <ul className="list-none divide-y divide-border border-t border-border p-0">
              {requests.map((item) => (
                <li className="p-5" key={item.id}>
                  <div className="grid gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="grid size-9 shrink-0 place-items-center rounded-full bg-subtle text-xs font-semibold text-primary"
                        >
                          {item.student_name.slice(0, 1).toUpperCase()}
                        </span>
                        <strong className="font-semibold text-primary">{item.student_name}</strong>
                      </div>
                      <p className="mt-1 text-sm text-muted">{categoryLabel(item.category)}</p>
                      <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                        <Clock3 size={14} aria-hidden="true" />
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
          className="overflow-hidden rounded-xl border border-border bg-surface"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 bg-background/40 px-5 pt-5 pb-4">
            <div>
              <h2
                id="agenda-heading"
                className="flex items-center gap-2 text-base font-semibold text-foreground"
              >
                <CalendarDays size={17} className="text-muted" aria-hidden="true" /> Upcoming
                consultations
              </h2>
              <p className="mt-1 text-sm text-muted">Your next confirmed appointments.</p>
            </div>
            <Link
              className="text-xs font-medium text-primary hover:underline"
              href="/faculty/consultations"
            >
              View all consultations
            </Link>
          </div>
          {agenda.length === 0 ? (
            <p className="m-5 rounded-lg bg-background px-4 py-8 text-center text-sm text-muted">
              No confirmed consultations scheduled.
            </p>
          ) : (
            <ul className="list-none divide-y divide-border border-t border-border p-0">
              {agenda.map((item) => (
                <li className="flex flex-wrap items-center justify-between gap-4 p-5" key={item.id}>
                  <div className="flex min-w-0 items-start gap-3">
                    <time
                      dateTime={item.slot_date}
                      className="grid size-11 shrink-0 place-content-center rounded-lg border border-border bg-background text-center text-lg font-semibold text-primary"
                    >
                      <span className="text-[0.6rem] font-medium tracking-wide text-muted uppercase">
                        {new Intl.DateTimeFormat('en-PH', {
                          month: 'short',
                          timeZone: 'Asia/Manila',
                        }).format(new Date(`${item.slot_date}T00:00:00+08:00`))}
                      </span>
                      {item.slot_date.slice(-2)}
                    </time>
                    <div>
                      <p className="text-sm font-semibold text-primary">
                        <time dateTime={item.slot_date}>{formatDay(item.slot_date)}</time> ·{' '}
                        {formatTimeRange(item.start_time, item.end_time)}
                      </p>
                      <strong className="mt-1 block font-semibold">{item.student_name}</strong>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                        <MapPin size={13} aria-hidden="true" />
                        {modeLabel(item)}
                      </p>
                    </div>
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
