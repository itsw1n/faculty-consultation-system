import { PageHeading } from '@/components/common/PageHeading'
import { ApplicationReviewList } from '@/features/applications/components/ApplicationReviewList'
import {
  getAccountCounts,
  getApplicationPage,
} from '@/features/applications/repositories/applicationRepository'
import { listDepartments } from '@/features/admin/repositories/adminRepository'
import { ApplicationFilters } from '@/features/applications/components/ApplicationFilters'
import { AddFacultyButton } from '@/features/applications/components/AddFacultyButton'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { SummaryStats } from '@/components/common/SummaryStats'

export default async function ManageUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string; department?: string }>
}) {
  await requireRole('ADMIN')
  const parameters = await searchParams
  const [page, departments, counts] = await Promise.all([
    getApplicationPage(parameters),
    listDepartments(),
    getAccountCounts(),
  ])
  return (
    <>
      <PageHeading
        title="Manage Users"
        description="Everyone with a school email is a student by default. Promote faculty here."
      />
      <div className="mb-5">
        <SummaryStats
          items={[
            { label: 'Active users', value: counts.total },
            { label: 'Students', value: counts.students },
            { label: 'Faculty', value: counts.faculty },
            { label: 'Admins', value: counts.admins },
          ]}
        />
      </div>
      <ApplicationFilters
        departments={departments}
        action={<AddFacultyButton departments={departments} />}
      />
      <ApplicationReviewList
        key={`${parameters.search}:${parameters.role}:${parameters.department}`}
        initialPage={page}
        filters={{
          search: parameters.search ?? '',
          role: parameters.role ?? '',
          department: parameters.department ?? '',
        }}
        departments={departments}
      />
    </>
  )
}
