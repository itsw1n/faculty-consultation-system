import Link from 'next/link'
import { ArrowUpRight, CalendarDays, ClipboardList, Users } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeading } from '@/components/common/PageHeading'
import { StatusBadge } from '@/components/common/StatusBadge'
import { SummaryStats } from '@/components/common/SummaryStats'
import { getAdminDashboard } from '@/features/dashboard/repositories/dashboardRepository'
import { AdminRecentConsultationsTable } from '@/features/dashboard/components/AdminRecentConsultationsTable'
import { requireRole } from '@/features/auth/repositories/authRepository'

const quickActions = [
  {
    href: '/admin/users',
    label: 'Manage users',
    description: 'Accounts, faculty roles, and assignments',
    icon: Users,
  },
  {
    href: '/admin/departments',
    label: 'Departments',
    description: 'Official codes and school directory',
    icon: ClipboardList,
  },
  {
    href: '/admin/consultations',
    label: 'Consultation records',
    description: 'Activity records and summary exports',
    icon: CalendarDays,
  },
]

export default async function AdminDashboard() {
  await requireRole('ADMIN')
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
        description="School accounts, faculty capacity, and consultation activity in one place."
      />
      <SummaryStats
        className="grid-cols-2 sm:grid-cols-4"
        items={[
          { label: 'Students', value: data.students, description: 'Approved accounts' },
          { label: 'Faculty', value: data.faculty, description: 'Approved accounts' },
          { label: 'Consultations', value: data.consultations, description: 'All records' },
          { label: 'Open slots', value: data.open_slots, description: 'Available to students' },
        ]}
      />
      <section className="mt-6" aria-labelledby="management-heading">
        <h2
          id="management-heading"
          className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase"
        >
          Quick actions
        </h2>
        <div className="grid gap-3 xl:grid-cols-3">
          {quickActions.map(({ href, label, description, icon: Icon }) => (
            <Link
              href={href}
              key={href}
              className="group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/30 hover:bg-subtle focus-visible:outline-3 focus-visible:outline-focus"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-subtle text-primary">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <strong className="block text-sm font-semibold text-foreground">{label}</strong>
                <span className="mt-0.5 block text-xs text-muted">{description}</span>
              </span>
              <ArrowUpRight
                size={15}
                aria-hidden="true"
                className="ml-auto shrink-0 text-muted group-hover:text-primary"
              />
            </Link>
          ))}
        </div>
      </section>
      {data.faculty === 0 && (
        <EmptyState
          title="No Faculty accounts yet"
          description="Ask Faculty to register with a school email, then promote them in Manage Users."
          action={
            <Link
              className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
              href="/admin/users"
            >
              Manage Users
            </Link>
          }
        />
      )}
      <div className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <section aria-labelledby="activity-heading" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="activity-heading" className="text-base font-semibold text-foreground">
                Recent consultations
              </h2>
              <p className="mt-1 text-xs text-muted">
                Latest activity across the school. Consultation content stays private.
              </p>
            </div>
            <Link
              className="inline-flex min-h-9 items-center gap-1 text-xs font-medium text-primary hover:underline"
              href="/admin/consultations"
            >
              View all records <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <AdminRecentConsultationsTable items={data.recent} />
        </section>
        <aside className="grid items-start gap-5 sm:grid-cols-2 xl:grid-cols-1">
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-base font-semibold text-foreground">Needs attention</h2>
            <p className="mt-1 text-xs text-muted">Follow up with the relevant faculty.</p>
            <div className="mt-4 divide-y divide-border border-t border-border">
              <Link
                className="flex items-start justify-between gap-4 py-4 hover:text-primary focus-visible:outline-3 focus-visible:outline-focus"
                href="/admin/consultations"
              >
                <span>
                  <strong className="block text-sm font-medium">
                    Pending consultation requests
                  </strong>
                  <span className="mt-1 block text-xs text-muted">
                    Waiting for a faculty decision
                  </span>
                </span>
                <span className="rounded-md bg-warning/8 px-2 py-1 text-sm font-semibold text-warning">
                  {data.pending}
                </span>
              </Link>
              <Link
                className="flex items-start justify-between gap-4 pt-4 hover:text-primary focus-visible:outline-3 focus-visible:outline-focus"
                href="/admin/users?role=FACULTY"
              >
                <span>
                  <strong className="block text-sm font-medium">
                    Faculty without future slots
                  </strong>
                  <span className="mt-1 block text-xs text-muted">
                    May need to publish availability
                  </span>
                </span>
                <span className="rounded-md bg-subtle px-2 py-1 text-sm font-semibold text-primary">
                  {data.faculty_without_future_slots}
                </span>
              </Link>
            </div>
          </section>
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-base font-semibold text-foreground">Consultation activity</h2>
            <p className="mt-1 text-xs text-muted">All records by current status</p>
            <dl className="mt-4 divide-y divide-border border-t border-border">
              {lifecycle.map(([status, count]) => (
                <div
                  className="flex items-center justify-between py-2.5 last:pb-0"
                  key={String(status)}
                >
                  <dt>
                    <StatusBadge status={String(status).toUpperCase()} />
                  </dt>
                  <dd className="text-sm font-semibold text-foreground tabular-nums">{count}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </>
  )
}
