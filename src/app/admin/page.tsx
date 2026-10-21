import Link from 'next/link'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeading } from '@/components/common/PageHeading'
import { SummaryStats } from '@/components/common/SummaryStats'
import { getAdminDashboard } from '@/features/dashboard/repositories/dashboardRepository'
export default async function AdminDashboard() {
  const data = await getAdminDashboard()
  return (
    <>
      <PageHeading
        eyebrow="Administration workspace"
        title="Admin Dashboard"
        description="Manage school accounts and oversee consultation activity."
      />
      <SummaryStats
        items={[
          { label: 'Students', value: data.students, description: 'Approved accounts' },
          { label: 'Faculty', value: data.faculty, description: 'Approved accounts' },
          { label: 'Consultations', value: data.consultations, description: 'All records' },
        ]}
      />
      {data.faculty === 0 && (
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
      )}
    </>
  )
}
