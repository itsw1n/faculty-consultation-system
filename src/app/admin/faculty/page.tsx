import { PageHeading } from '@/components/common/PageHeading'
import { StatusBadge } from '@/components/common/StatusBadge'
import { listFacultyRecords } from '@/features/admin/repositories/adminRepository'
export default async function FacultyPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const p = await searchParams
  const faculty = await listFacultyRecords(p.search)
  return (
    <>
      <PageHeading
        title="Manage Faculty"
        description="View approved faculty profiles and departments."
      />
      <form className="grid items-end gap-3 rounded-xl border border-border bg-surface p-4 sm:flex">
        <label className="grid flex-1 gap-1.5 text-xs font-bold">
          <span>Search faculty</span>
          <input
            className="min-h-11 rounded-lg border border-border px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus"
            name="search"
            defaultValue={p.search}
          />
        </label>
        <button className="min-h-11 rounded-lg bg-primary px-4 font-bold text-white">Search</button>
      </form>
      <section className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
        {faculty.length === 0 ? (
          <p className="p-8 text-center text-muted">No faculty found.</p>
        ) : (
          faculty.map((member) => (
            <article
              className="grid items-center gap-4 border-b border-border p-4 last:border-0 sm:grid-cols-[2fr_1fr_auto]"
              key={member.id}
            >
              <div>
                <strong>{member.full_name}</strong>
                <p className="mt-1 text-sm text-muted">{member.email}</p>
              </div>
              <div>
                <strong>{member.departments?.[0]?.code}</strong>
                <p className="mt-1 text-sm text-muted">
                  {member.faculty_profiles?.[0]?.position_title}
                </p>
              </div>
              <StatusBadge status={member.account_status} />
            </article>
          ))
        )}
      </section>
    </>
  )
}
