import Link from 'next/link'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeading } from '@/components/common/PageHeading'
import { SummaryStats } from '@/components/common/SummaryStats'
import { getFacultyDashboard } from '@/features/dashboard/repositories/dashboardRepository'
import { CalendarPlus } from 'lucide-react'
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
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-focus"
            href="/faculty/availability"
          >
            <CalendarPlus size={18} aria-hidden="true" /> Add availability
          </Link>
        }
      />
      <SummaryStats
        items={[
          { label: 'Pending requests', value: data.pending, description: 'Need a decision' },
          { label: 'Upcoming', value: data.upcoming, description: 'Approved consultations' },
          { label: 'Open slots', value: data.openSlots, description: 'Available to students' },
        ]}
      />
      {data.openSlots === 0 && (
        <EmptyState
          title="No availability added"
          description="Add an available time so students can request a consultation."
          action={
            <Link
              className="mt-5 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-focus"
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
