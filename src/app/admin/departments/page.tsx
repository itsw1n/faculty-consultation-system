import { PageHeading } from '@/components/common/PageHeading'
import { createDepartment, updateDepartment } from '@/features/admin/actions'
import { listDepartments } from '@/features/admin/repositories/adminRepository'

export default async function DepartmentsPage() {
  const departments = await listDepartments()

  return (
    <>
      <PageHeading title="Departments" description="Manage departments used in applications and faculty discovery." />
      <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <h2 className="text-xl font-bold">Add department</h2>
        <form action={createDepartment} className="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_2fr_auto]">
          <label className="grid gap-1.5 text-xs font-bold">
            Code
            <input className="min-h-11 rounded-lg border border-border px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus" name="code" required minLength={2} maxLength={20} />
          </label>
          <label className="grid gap-1.5 text-xs font-bold">
            Name
            <input className="min-h-11 rounded-lg border border-border px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus" name="name" required minLength={2} maxLength={120} />
          </label>
          <button className="min-h-11 rounded-lg bg-primary px-4 font-bold text-white">Add department</button>
        </form>
      </section>
      <section className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4" aria-label="Existing departments">
        {departments.map((department) => (
          <article className="rounded-xl border border-border bg-surface p-5" key={department.id}>
            <form action={updateDepartment} className="grid gap-3">
              <input type="hidden" name="id" value={department.id} />
              <label className="grid gap-1.5 text-xs font-bold">
                Code
                <input className="min-h-11 rounded-lg border border-border px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus" name="code" defaultValue={department.code} required minLength={2} maxLength={20} />
              </label>
              <label className="grid gap-1.5 text-xs font-bold">
                Name
                <input className="min-h-11 rounded-lg border border-border px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus" name="name" defaultValue={department.name} required minLength={2} maxLength={120} />
              </label>
              <button className="min-h-11 rounded-lg bg-primary px-4 font-bold text-white">Save changes</button>
            </form>
          </article>
        ))}
      </section>
    </>
  )
}
