import Link from 'next/link'
import { CalendarDays, ClipboardList, Users } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeading } from '@/components/common/PageHeading'
import { StatusBadge } from '@/components/common/StatusBadge'
import { SummaryStats } from '@/components/common/SummaryStats'
import { getAdminDashboard } from '@/features/dashboard/repositories/dashboardRepository'

const quickActions = [
  {
    href: '/admin/users',
    label: 'Manage users',
    description: 'Promote registered students and correct account details.',
    icon: Users,
  },
  {
    href: '/admin/consultations',
    label: 'Consultation records',
    description: 'Review activity and download a summary report.',
    icon: CalendarDays,
  },
  {
    href: '/admin/departments',
    label: 'Departments',
    description: 'Maintain the departments used for accounts and faculty.',
    icon: ClipboardList,
  },
]

export default async function AdminDashboard() {
  const data = await getAdminDashboard()
  const lifecycle = [
    ['Pending', data.pending],
    ['Approved', data.approved],
    ['Completed', data.completed],
    ['Cancelled', data.cancelled],
    ['Rejected', data.rejected],
  ]

  return (
    <>
      <PageHeading
        eyebrow="Administration workspace"
        title="Admin Dashboard"
        description="Manage school accounts, faculty capacity, and consultation activity."
      />
      <SummaryStats
        items={[
          { label: 'Students', value: data.students, description: 'Approved accounts' },
          { label: 'Faculty', value: data.faculty, description: 'Approved accounts' },
          { label: 'Consultations', value: data.consultations, description: 'All records' },
          { label: 'Open slots', value: data.open_slots, description: 'Available to students' },
        ]}
      />

      {data.faculty === 0 ? (
        <EmptyState
          title="No Faculty accounts yet"
          description="Ask Faculty to register with a school email, then promote them in Manage Users."
          action={
            <Link
              className="mt-5 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-focus"
              href="/admin/users"
            >
              Manage Users
            </Link>
          }
        />
      ) : (
        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold text-primary">Needs attention</h2>
            <p className="mt-1 text-sm text-muted">
              Items that may need an administrator to follow up.
            </p>
            <div className="mt-4 divide-y divide-border border-y border-border">
              <Link
                className="flex items-center justify-between gap-4 py-4 hover:text-primary"
                href="/admin/consultations"
              >
                <span>
                  <strong className="block font-semibold text-primary">
                    Pending consultation requests
                  </strong>
                  <span className="text-sm text-muted">Waiting for a faculty decision</span>
                </span>
                <span className="text-2xl font-semibold text-primary">{data.pending}</span>
              </Link>
              <Link
                className="flex items-center justify-between gap-4 py-4 hover:text-primary"
                href="/admin/users?role=FACULTY"
              >
                <span>
                  <strong className="block font-semibold text-primary">
                    Faculty without future slots
                  </strong>
                  <span className="text-sm text-muted">
                    May need a reminder to publish availability
                  </span>
                </span>
                <span className="text-2xl font-semibold text-primary">
                  {data.faculty_without_future_slots}
                </span>
              </Link>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold text-primary">Consultation activity</h2>
            <p className="mt-1 text-sm text-muted">
              A summary of the current consultation lifecycle.
            </p>
            <dl className="mt-4 divide-y divide-border border-y border-border">
              {lifecycle.map(([status, count]) => (
                <div className="flex items-center justify-between py-3" key={String(status)}>
                  <dt>
                    <StatusBadge status={String(status).toUpperCase()} />
                  </dt>
                  <dd className="font-semibold text-primary">{count}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      )}

      <section className="mt-6 overflow-hidden rounded-lg border border-border bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-primary">Recent consultations</h2>
            <p className="mt-1 text-sm text-muted">
              Latest consultation activity across the school.
            </p>
          </div>
          <Link className="font-semibold text-primary hover:underline" href="/admin/consultations">
            View all records
          </Link>
        </div>
        {data.recent.length === 0 ? (
          <p className="p-8 text-center text-muted">No consultation activity yet.</p>
        ) : (
          <>
            <div className="hidden grid-cols-[1fr_1fr_0.9fr_auto] gap-4 border-b border-border bg-background px-5 py-3 text-xs font-semibold tracking-wide text-muted uppercase md:grid">
              <span>Student</span>
              <span>Faculty</span>
              <span>Schedule</span>
              <span>Status</span>
            </div>
            {data.recent.map((item) => (
              <article
                className="grid gap-4 border-b border-border px-5 py-4 last:border-0 sm:grid-cols-2 md:grid-cols-[1fr_1fr_0.9fr_auto] md:items-center"
                key={item.id}
              >
                <p>
                  <span className="mb-1 block text-xs font-semibold text-muted uppercase md:hidden">
                    Student
                  </span>
                  <strong className="font-semibold text-primary">{item.student_name}</strong>
                </p>
                <p>
                  <span className="mb-1 block text-xs font-semibold text-muted uppercase md:hidden">
                    Faculty
                  </span>
                  <span className="text-sm text-muted">{item.faculty_name}</span>
                </p>
                <p className="text-sm text-muted">
                  <span className="mb-1 block text-xs font-semibold text-muted uppercase md:hidden">
                    Schedule
                  </span>
                  {item.slot_date} · {item.start_time.slice(0, 5)}–{item.end_time.slice(0, 5)}
                </p>
                <div>
                  <span className="mb-1 block text-xs font-semibold text-muted uppercase md:hidden">
                    Status
                  </span>
                  <StatusBadge status={item.consultation_status} />
                </div>
              </article>
            ))}
          </>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-primary">Quick actions</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {quickActions.map(({ href, label, description, icon: Icon }) => (
            <Link
              className="rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-subtle focus-visible:outline-3 focus-visible:outline-focus"
              href={href}
              key={href}
            >
              <Icon className="text-accent" size={20} aria-hidden="true" />
              <strong className="mt-4 block text-primary">{label}</strong>
              <span className="mt-1 block text-sm leading-relaxed text-muted">{description}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
