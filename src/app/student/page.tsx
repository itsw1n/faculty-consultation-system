import Link from 'next/link'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeading } from '@/components/common/PageHeading'
import { StatusBadge } from '@/components/common/StatusBadge'
import { SummaryStats } from '@/components/common/SummaryStats'
import { getStudentDashboard } from '@/features/dashboard/repositories/dashboardRepository'
import { CalendarPlus, History } from 'lucide-react'
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
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-focus"
            href="/student/book"
          >
            <CalendarPlus size={18} aria-hidden="true" /> Book consultation
          </Link>
        }
      />
      <SummaryStats
        items={[
          { label: 'Upcoming', value: data.upcoming, description: 'Confirmed consultations' },
          { label: 'Pending', value: data.pending, description: 'Awaiting faculty review' },
        ]}
      />
      {data.recent.length ? (
        <section className="mt-6 border-t border-border pt-5">
          <div className="mb-2 flex items-center gap-2">
            <History size={18} className="text-muted" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-primary">Recent consultations</h2>
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
              className="mt-5 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-focus"
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
