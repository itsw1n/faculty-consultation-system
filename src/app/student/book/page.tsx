import { PageHeading } from '@/components/common/PageHeading'
import { listDepartments } from '@/features/admin/repositories/adminRepository'
import { FacultyDirectory } from '@/features/booking/components/FacultyDirectory'
import { getFacultyPage } from '@/features/booking/repositories/bookingRepository'
export default async function ChooseFaculty({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; department?: string }>
}) {
  const p = await searchParams
  const [page, departments] = await Promise.all([
    getFacultyPage(p.search, p.department),
    listDepartments(),
  ])
  return (
    <>
      <PageHeading
        eyebrow="Student workspace"
        title="Book Consultation"
        description="Choose a faculty member to view available schedules."
      />
      <FacultyDirectory
        key={`${p.search ?? ''}:${p.department ?? ''}`}
        initialPage={page}
        departments={departments}
      />
    </>
  )
}
