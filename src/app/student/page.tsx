import Link from 'next/link'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeading } from '@/components/common/PageHeading'
import { StatusBadge } from '@/components/common/StatusBadge'
import { getStudentDashboard } from '@/features/dashboard/repositories/dashboardRepository'
import { CalendarPlus, Clock3, History } from 'lucide-react'
const card = 'rounded-xl border border-border bg-surface p-5 shadow-card'
export default async function StudentDashboard() {
  const data = await getStudentDashboard()
  return (
    <>
      <PageHeading
        eyebrow="Student workspace"
        title="Good morning"
        description="Keep track of your faculty consultations in one place."
        action={
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 font-bold text-white shadow-sm hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus"
            href="/student/book"
          >
            <CalendarPlus size={18} aria-hidden="true" /> Book consultation
          </Link>
        }
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-4">
        <section className={card}>
          <div className="flex items-center justify-between text-accent">
            <span className="text-sm font-semibold">Upcoming</span>
            <Clock3 size={19} aria-hidden="true" />
          </div>
          <strong className="mt-4 block text-3xl text-primary">{data.upcoming}</strong>
          <p className="mt-1 text-sm text-muted">Confirmed consultations</p>
        </section>
        <section className={card}>
          <div className="flex items-center justify-between text-primary">
            <span className="text-sm font-semibold">Pending</span>
            <Clock3 size={19} aria-hidden="true" />
          </div>
          <strong className="mt-4 block text-3xl text-primary">{data.pending}</strong>
          <p className="mt-1 text-sm text-muted">Requests awaiting review</p>
        </section>
      </div>
      {data.recent.length ? (
        <section className="mt-4 rounded-xl border border-border bg-surface p-5">
          <div className="mb-2 flex items-center gap-2">
            <History size={19} className="text-accent" aria-hidden="true" />
            <h2 className="text-xl font-bold text-primary">Recent consultations</h2>
          </div>
          {data.recent.map((item) => (
            <article
              className="flex items-center justify-between border-b border-border py-3 last:border-0"
              key={item.id}
            >
              <strong>{item.purpose}</strong>
              <StatusBadge status={item.status} />
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          title="No consultations yet"
          description="Choose a faculty member and request a suitable schedule."
          action={
            <Link
              className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 font-bold text-white"
              href="/student/book"
            >
              Book Consultation
            </Link>
          }
        />
      )}
    </>
  )
}
