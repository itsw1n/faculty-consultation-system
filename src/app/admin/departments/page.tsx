import { Button } from '@/components/common/button/Button'
import { PageHeading } from '@/components/common/PageHeading'
import { createDepartment, updateDepartment } from '@/features/admin/actions'
import { listDepartments } from '@/features/admin/repositories/adminRepository'

export default async function DepartmentsPage() {
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
      <section
        className="mt-6 overflow-hidden rounded-lg border border-border bg-surface"
        aria-label="Existing departments"
      >
        {departments.map((department) => (
          <article className="border-b border-border p-4 last:border-0" key={department.id}>
            <form
              action={updateDepartment}
              className="grid items-end gap-3 sm:grid-cols-[minmax(7rem,.7fr)_minmax(12rem,2fr)_auto]"
            >
              <input type="hidden" name="id" value={department.id} />
              <label className="grid gap-1.5 text-xs font-bold">
                Code
                <input
                  className="min-h-11 rounded-md border border-border px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus"
                  name="code"
                  defaultValue={department.code}
                  required
                  minLength={2}
                  maxLength={20}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-bold">
                Name
                <input
                  className="min-h-11 rounded-md border border-border px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus"
                  name="name"
                  defaultValue={department.name}
                  required
                  minLength={2}
                  maxLength={120}
                />
              </label>
              <Button type="submit" variant="secondary">
                Save changes
              </Button>
            </form>
          </article>
        ))}
      </section>
    </>
  )
}
