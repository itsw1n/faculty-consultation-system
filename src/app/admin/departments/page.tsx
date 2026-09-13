import { PageHeading } from '@/components/common/PageHeading'
import { createDepartment, updateDepartment } from '@/features/admin/actions'
import { listDepartments } from '@/features/admin/repositories/adminRepository'

export default async function DepartmentsPage() {
  const departments = await listDepartments()

  return (
    <>
      <PageHeading title="Departments" description="Manage departments used in applications and faculty discovery." />
      <section className="form-card compact-card">
        <h2>Add department</h2>
        <form action={createDepartment} className="department-form">
          <label>
            Code
            <input name="code" required minLength={2} maxLength={20} />
          </label>
          <label>
            Name
            <input name="name" required minLength={2} maxLength={120} />
          </label>
          <button className="primary-button">Add department</button>
        </form>
      </section>
      <section className="department-grid" aria-label="Existing departments">
        {departments.map((department) => (
          <article key={department.id}>
            <form action={updateDepartment} className="department-edit-form">
              <input type="hidden" name="id" value={department.id} />
              <label>
                Code
                <input name="code" defaultValue={department.code} required minLength={2} maxLength={20} />
              </label>
              <label>
                Name
                <input name="name" defaultValue={department.name} required minLength={2} maxLength={120} />
              </label>
              <button>Save changes</button>
            </form>
          </article>
        ))}
      </section>
    </>
  )
}
