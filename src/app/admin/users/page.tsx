import { PageHeading } from '@/components/common/PageHeading'
import { ApplicationReviewList } from '@/features/applications/components/ApplicationReviewList'
import {
  getAccountCounts,
  getApplicationPage,
} from '@/features/applications/repositories/applicationRepository'
import { listDepartments } from '@/features/admin/repositories/adminRepository'
import { ApplicationFilters } from '@/features/applications/components/ApplicationFilters'
import { AddFacultyButton } from '@/features/applications/components/AddFacultyButton'
import { GraduationCap, ShieldCheck, UserRound, Users } from 'lucide-react'
import { requireRole } from '@/features/auth/repositories/authRepository'

export default async function ManageUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; role?: string; department?: string }>
}) {
  await requireRole('ADMIN')
  const parameters = await searchParams
  const [page, departments, counts] = await Promise.all([
    getApplicationPage({ ...parameters, status: parameters.status ?? '' }),
    listDepartments(),
    getAccountCounts(),
  ])
  const summaries = [
    { label: 'Total users', value: counts.total, icon: Users },
    { label: 'Students', value: counts.students, icon: UserRound },
    { label: 'Faculty', value: counts.faculty, icon: GraduationCap },
    { label: 'Admins', value: counts.admins, icon: ShieldCheck },
  ]
  return (
    <>
      <PageHeading
        title="Manage Users"
        description="Everyone with a school email is a student by default. Promote faculty here."
      />
      <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-4">
        {summaries.map(({ label, value, icon: Icon }) => (
          <section
            className="rounded-xl border border-border bg-surface p-5 shadow-card"
            key={label}
          >
            <div className="flex items-center justify-between text-accent">
              <span className="text-sm font-semibold">{label}</span>
              <Icon size={19} aria-hidden="true" />
            </div>
            <strong className="mt-4 block text-3xl text-primary">{value}</strong>
          </section>
        ))}
      </div>
      <ApplicationFilters
        departments={departments}
        action={<AddFacultyButton departments={departments} />}
      />
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
