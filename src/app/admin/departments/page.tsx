import { CreateDepartmentForm } from '@/features/admin/components/CreateDepartmentForm'
import { PageHeading } from '@/components/common/PageHeading'
import { DepartmentTable } from '@/features/admin/components/DepartmentTable'
import { listDepartments } from '@/features/admin/repositories/adminRepository'
import { requireRole } from '@/features/auth/repositories/authRepository'

export default async function DepartmentsPage() {
  await requireRole('ADMIN')
  const departments = await listDepartments()

  return (
    <>
      <PageHeading
        eyebrow="Administration workspace"
        title="Departments"
        description="Keep the school directory organized with official department codes and names."
      />
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-base font-semibold text-foreground">Add department</h2>
        <p className="mt-1 text-sm text-muted">
          Use the official code and complete department name.
        </p>
        <CreateDepartmentForm />
      </section>
      <section className="mt-6" aria-label="Existing departments">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground">Department directory</h2>
          <p className="text-xs text-muted">{departments.length} departments</p>
        </div>
        <DepartmentTable departments={departments} />
      </section>
    </>
  )
}
