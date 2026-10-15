import { PageHeading } from '@/components/common/PageHeading'
import { ApplicationReviewList } from '@/features/applications/components/ApplicationReviewList'
import { getApplicationPage } from '@/features/applications/repositories/applicationRepository'
import { getDepartments } from '@/features/auth/repositories/authRepository'
import { ApplicationFilters } from '@/features/applications/components/ApplicationFilters'

export default async function ManageUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; role?: string; department?: string }>
}) {
  const parameters = await searchParams
  const [page, departments] = await Promise.all([
    getApplicationPage({ ...parameters, status: parameters.status ?? '' }),
    getDepartments(),
  ])
  return (
    <>
      <PageHeading
        title="Manage Users"
        description="Everyone with a school email is a student by default. Promote faculty here."
      />
      <ApplicationFilters departments={departments} />
      <ApplicationReviewList
        key={`${parameters.search}:${parameters.status}:${parameters.role}:${parameters.department}`}
        initialPage={page}
        filters={{
          search: parameters.search ?? '',
          status: parameters.status ?? '',
          role: parameters.role ?? '',
          department: parameters.department ?? '',
        }}
        departments={departments}
      />
    </>
  )
}
