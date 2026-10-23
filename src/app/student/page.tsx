import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  Clock,
  MapPin,
  UserRound,
} from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeading } from '@/components/common/PageHeading'
import { StatusBadge } from '@/components/common/StatusBadge'
import { requireRole } from '@/features/auth/repositories/authRepository'
import {
  getStudentDashboard,
  type StudentDashboardSummary,
} from '@/features/dashboard/repositories/dashboardRepository'
import { categoryLabel } from '@/features/consultations/categories'
import type { ConsultationItem } from '@/features/consultations/types'

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'Asia/Manila',
})
const fullDateFormatter = new Intl.DateTimeFormat('en-PH', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Manila',
})
const monthDayFormatter = new Intl.DateTimeFormat('en-PH', {
  month: 'short',
  day: '2-digit',
  timeZone: 'Asia/Manila',
})
const weekdayFormatter = new Intl.DateTimeFormat('en-PH', {
  weekday: 'long',
  timeZone: 'Asia/Manila',
})
const timeFormatter = new Intl.DateTimeFormat('en-PH', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'Asia/Manila',
})

function slotDate(value: string) {
  return new Date(`${value}T00:00:00+08:00`)
}
function formatDate(value: string) {
  return dateFormatter.format(slotDate(value))
}
function formatFullDate(value: string) {
  return fullDateFormatter.format(slotDate(value))
}
function formatTime(value: string) {
  return timeFormatter.format(new Date(`2000-01-01T${value}+08:00`))
}
function modeLabel(value: ConsultationItem['mode']) {
  return value === 'ONLINE' ? 'Online' : 'In person'
}
function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hourCycle: 'h23',
      timeZone: 'Asia/Manila',
    }).format(new Date())
  )
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || 'there'
}

function NextConsultation({ summary }: { summary: StudentDashboardSummary }) {
  if (!summary.next_consultation_id || !summary.next_slot_date) return null
  const start = summary.next_start_time
  const end = summary.next_end_time
  return (
    <section
      aria-labelledby="next-consultation-heading"
      className="rounded-lg border border-border bg-surface p-5 sm:p-6 lg:col-start-1"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="next-consultation-heading" className="text-xl font-semibold text-primary">
            <span className="block text-xs font-semibold tracking-[0.12em] text-accent uppercase">
              Next consultation
            </span>
            <span className="mt-1 block">{summary.next_faculty_name}</span>
          </h2>
          <p className="text-sm text-muted">
            {summary.next_faculty_department ?? 'Department not assigned'}
          </p>
        </div>
        <StatusBadge status="APPROVED" />
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-[7rem_minmax(0,1fr)]">
        <time
          dateTime={summary.next_slot_date}
          className="grid place-content-center rounded-lg border border-border bg-subtle px-3 py-4 text-center"
        >
          <span className="text-xs font-semibold tracking-wide text-muted uppercase">
            {monthDayFormatter.format(slotDate(summary.next_slot_date))}
          </span>
          <span className="mt-1 text-sm font-semibold text-primary">
            {weekdayFormatter.format(slotDate(summary.next_slot_date))}
          </span>
        </time>
        <dl className="grid gap-3 text-sm">
          <div className="flex items-start gap-2">
            <dt className="flex items-center gap-2 font-semibold text-primary">
              <Clock className="size-4 shrink-0 text-muted" aria-hidden="true" />
              Time
            </dt>
            <dd className="ml-auto text-right text-muted">
              {start && end ? (
                <>
                  <time dateTime={`${summary.next_slot_date}T${start}`}>{formatTime(start)}</time>
                  {'–'}
                  <time dateTime={`${summary.next_slot_date}T${end}`}>{formatTime(end)}</time>
                </>
              ) : (
                'Time not set'
              )}
            </dd>
          </div>
          <div className="flex items-start gap-2">
            <dt className="flex items-center gap-2 font-semibold text-primary">
              <UserRound className="size-4 shrink-0 text-muted" aria-hidden="true" />
              Category
            </dt>
            <dd className="ml-auto text-right text-muted">
              {summary.next_category ? categoryLabel(summary.next_category) : 'Not set'}
            </dd>
          </div>
          <div className="flex items-start gap-2">
            <dt className="flex items-center gap-2 font-semibold text-primary">
              <MapPin className="size-4 shrink-0 text-muted" aria-hidden="true" />
              Where
            </dt>
            <dd className="ml-auto text-right text-muted">
              {summary.next_mode ? modeLabel(summary.next_mode) : 'Not set'}
              {summary.next_location ? ` · ${summary.next_location}` : ''}
            </dd>
          </div>
        </dl>
      </div>
      <Link
        aria-label={`View details for ${summary.next_faculty_name} on ${formatFullDate(summary.next_slot_date)}`}
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-focus"
        href={`/student/consultations/${summary.next_consultation_id}`}
      >
        View details <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  )
}

function PendingRequests({ items, count }: { items: ConsultationItem[]; count: number }) {
  return (
    <section
      aria-labelledby="pending-heading"
      className="rounded-lg border border-border bg-surface p-5 sm:p-6 lg:col-start-1"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="pending-heading" className="text-lg font-semibold text-primary">
          Pending requests
          <span className="ml-2 text-sm font-normal text-muted">{count}</span>
        </h2>
        <Link
          className="text-sm font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-focus"
          href="/student/consultations"
        >
          View all consultations
        </Link>
      </div>
      {items.length ? (
        <ul className="mt-4 list-none divide-y divide-border border-t border-border p-0">
          {items.map((item) => (
            <li className="py-4" key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-primary">{item.faculty_name}</p>
                  <p className="text-sm text-muted">
                    {item.faculty_department ?? 'Department not assigned'}
                  </p>
                </div>
                <StatusBadge status={item.consultation_status} />
              </div>
              <p className="mt-2 text-sm text-muted">
                <time dateTime={item.slot_date}>{formatDate(item.slot_date)}</time> ·{' '}
                <time dateTime={`${item.slot_date}T${item.start_time}`}>
                  {formatTime(item.start_time)}
                </time>
                {'–'}
                <time dateTime={`${item.slot_date}T${item.end_time}`}>
                  {formatTime(item.end_time)}
                </time>
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-sm text-primary">{categoryLabel(item.category)}</p>
                <Link
                  aria-label={`View details for ${categoryLabel(item.category)} with ${item.faculty_name} on ${formatDate(item.slot_date)}`}
                  className="text-sm font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-focus"
                  href={`/student/consultations/${item.id}`}
                >
                  View details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted">No requests awaiting review.</p>
      )}
    </section>
  )
}

function NoNextConsultation() {
  return (
    <section
      aria-labelledby="no-next-heading"
      className="rounded-lg border border-dashed border-border bg-surface p-6 lg:col-start-1"
    >
      <CalendarDays className="size-6 text-muted" aria-hidden="true" />
      <h2 id="no-next-heading" className="mt-3 text-lg font-semibold text-primary">
        No confirmed consultation
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Find a faculty member and choose a schedule that works for you.
      </p>
      <Link
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-focus"
        href="/student/book"
      >
        <CalendarPlus className="size-4" aria-hidden="true" /> Find a faculty member
      </Link>
    </section>
  )
}

function RecentConsultations({ items }: { items: ConsultationItem[] }) {
  return (
    <section
      aria-labelledby="recent-heading"
      className="rounded-lg border border-border bg-surface p-5 sm:p-6 lg:col-start-1"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="recent-heading" className="text-lg font-semibold text-primary">
          Recent consultations
        </h2>
        <Link
          className="text-sm font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-focus"
          href="/student/consultations"
        >
          View all consultations
        </Link>
      </div>
      {items.length ? (
        <ul className="mt-4 list-none divide-y divide-border border-t border-border p-0">
          {items.map((item) => (
            <li className="py-3" key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-primary">{item.faculty_name}</p>
                  <p className="text-sm text-muted">
                    <time dateTime={item.slot_date}>{formatDate(item.slot_date)}</time> ·{' '}
                    {categoryLabel(item.category)}
                  </p>
                </div>
                <StatusBadge status={item.consultation_status} />
              </div>
              <div className="mt-1 text-right">
                <Link
                  aria-label={`View details for ${categoryLabel(item.category)} with ${item.faculty_name} on ${formatDate(item.slot_date)}`}
                  className="text-sm font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-focus"
                  href={`/student/consultations/${item.id}`}
                >
                  View details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted">No other recent consultations.</p>
      )}
    </section>
  )
}

function SideRail({ summary }: { summary: StudentDashboardSummary }) {
  const stats = [
    { label: 'Upcoming', value: summary.upcoming },
    { label: 'Pending', value: summary.pending },
    { label: 'Completed', value: summary.completed },
  ]
  return (
    <aside className="grid gap-5 lg:col-start-2 lg:row-span-4">
      <section
        aria-labelledby="student-stats-heading"
        className="rounded-lg border border-border bg-surface p-5"
      >
        <h2 id="student-stats-heading" className="text-base font-semibold text-primary">
          At a glance
        </h2>
        <dl className="mt-4 divide-y divide-border border-y border-border">
          {stats.map((stat) => (
            <div className="flex items-center justify-between gap-3 py-3" key={stat.label}>
              <dt className="text-sm text-muted">{stat.label}</dt>
              <dd className="text-lg font-semibold text-primary">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section
        aria-labelledby="student-actions-heading"
        className="rounded-lg border border-border bg-surface p-5"
      >
        <h2 id="student-actions-heading" className="text-base font-semibold text-primary">
          Quick actions
        </h2>
        <ul className="mt-3 grid list-none gap-2 p-0">
          <li>
            <Link
              className="flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold text-primary hover:bg-subtle focus-visible:outline-3 focus-visible:outline-focus"
              href="/student/consultations"
            >
              <ClipboardList className="size-4" aria-hidden="true" /> My consultations
            </Link>
          </li>
          <li>
            <Link
              className="flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold text-primary hover:bg-subtle focus-visible:outline-3 focus-visible:outline-focus"
              href="/notifications"
            >
              <Bell className="size-4" aria-hidden="true" /> Notifications
            </Link>
          </li>
        </ul>
      </section>
    </aside>
  )
}

export default async function StudentDashboard() {
  const profile = await requireRole('STUDENT')
  const data = await getStudentDashboard()
  const { summary, pending, recent } = data
  const hasNext = Boolean(summary.next_consultation_id)
  const isEmpty = !hasNext && pending.length === 0 && recent.length === 0

  return (
    <>
      <PageHeading
        eyebrow="Student workspace"
        title={`${greeting()}, ${firstName(profile.fullName)}`}
        description="Your next consultation, pending requests, and recent activity."
        action={
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-focus"
            href="/student/book"
          >
            <CalendarPlus size={18} aria-hidden="true" /> Book consultation
          </Link>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        {isEmpty ? (
          <div className="lg:col-start-1">
            <EmptyState
              title="No consultations yet"
              description="Find a faculty member and request a schedule. Your next consultation and recent activity will appear here."
              action={
                <Link
                  className="mt-5 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-focus"
                  href="/student/book"
                >
                  Find a faculty member
                </Link>
              }
            />
          </div>
        ) : (
          <>
            {hasNext ? <NextConsultation summary={summary} /> : null}
            <PendingRequests items={pending} count={summary.pending} />
            {!hasNext ? <NoNextConsultation /> : null}
          </>
        )}
        <SideRail summary={summary} />
        {!isEmpty ? <RecentConsultations items={recent} /> : null}
      </div>
    </>
  )
}
