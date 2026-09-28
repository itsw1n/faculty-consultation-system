import Link from 'next/link'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeading } from '@/components/common/PageHeading'
import { getFacultyDashboard } from '@/features/dashboard/repositories/dashboardRepository'
import { CalendarPlus, ClipboardCheck, Clock3 } from 'lucide-react'
const card = 'rounded-xl border border-border bg-surface p-5 shadow-card'
export default async function FacultyDashboard() {
  const data = await getFacultyDashboard()
  return (
    <>
      <PageHeading
        eyebrow="Faculty workspace"
        title="Faculty Dashboard"
        description="Manage availability and consultation requests."
        action={
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 font-bold text-white shadow-sm hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus"
            href="/faculty/availability"
          >
            <CalendarPlus size={18} aria-hidden="true" /> Add availability
          </Link>
        }
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-4">
        <section className={card}>
          <div className="flex items-center justify-between text-accent">
            <span className="text-sm font-semibold">Pending requests</span>
            <ClipboardCheck size={19} aria-hidden="true" />
          </div>
          <strong className="mt-4 block text-3xl text-primary">{data.pending}</strong>
          <p className="mt-1 text-sm text-muted">Requests needing a decision</p>
        </section>
        <section className={card}>
          <div className="flex items-center justify-between text-accent">
            <span className="text-sm font-semibold">Upcoming</span>
            <Clock3 size={19} aria-hidden="true" />
          </div>
          <strong className="mt-4 block text-3xl text-primary">{data.upcoming}</strong>
          <p className="mt-1 text-sm text-muted">Approved consultations</p>
        </section>
        <section className={card}>
          <div className="flex items-center justify-between text-accent">
            <span className="text-sm font-semibold">Open slots</span>
            <CalendarPlus size={19} aria-hidden="true" />
          </div>
          <strong className="mt-4 block text-3xl text-primary">{data.openSlots}</strong>
          <p className="mt-1 text-sm text-muted">Available consultation times</p>
        </section>
      </div>
      {data.openSlots === 0 && (
        <EmptyState
          title="No availability added"
          description="Add an available time so students can request a consultation."
          action={
            <Link
              className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 font-bold text-white"
              href="/faculty/availability"
            >
              Add Availability
            </Link>
          }
        />
      )}
    </>
  )
}
