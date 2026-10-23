import { Button } from '@/components/common/button/Button'
import { PageHeading } from '@/components/common/PageHeading'
import { createDepartment } from '@/features/admin/actions'
import { DepartmentTable } from '@/features/admin/components/DepartmentTable'
import { listDepartments } from '@/features/admin/repositories/adminRepository'
import { requireRole } from '@/features/auth/repositories/authRepository'

export default async function DepartmentsPage() {
  await requireRole('ADMIN')
  const departments = await listDepartments()

  return (
    <>
      <PageHeading
        title="Departments"
        description="Manage departments used in applications and faculty discovery."
      />
      <section className="border-y border-border py-5">
        <h2 className="text-lg font-semibold text-primary">Add department</h2>
        <p className="mt-1 text-sm text-muted">
          Use the official code and complete department name.
        </p>
        <form
          action={createDepartment}
          className="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_2fr_auto]"
        >
          <label className="grid gap-1.5 text-xs font-bold">
            Code
            <input
              className="min-h-11 rounded-md border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus"
              name="code"
              required
              minLength={2}
              maxLength={20}
            />
          </label>
          <label className="grid gap-1.5 text-xs font-bold">
            Name
            <input
              className="min-h-11 rounded-md border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus"
              name="name"
              required
              minLength={2}
              maxLength={120}
            />
          </label>
          <Button type="submit">Add department</Button>
        </form>
      </section>
      <section className="mt-6" aria-label="Existing departments">
        <DepartmentTable departments={departments} />
      </section>
    </>
  )
}
