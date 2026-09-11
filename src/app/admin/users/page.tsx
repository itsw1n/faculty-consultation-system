import { PageHeading } from '@/components/common/PageHeading'
import { reviewApplication } from '@/features/applications/actions'
import { listApplications } from '@/features/applications/repositories/applicationRepository'

export default async function ManageUsersPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string }> }) {
  const parameters = await searchParams
  const applications = await listApplications(parameters.search, parameters.status ?? 'PENDING')
  return <><PageHeading title="Manage Users" description="Review student and faculty access applications."/>
    <form className="filter-bar"><label><span>Search</span><input name="search" defaultValue={parameters.search} placeholder="Search name or email"/></label><label><span>Status</span><select name="status" defaultValue={parameters.status ?? 'PENDING'}><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option><option value="">All</option></select></label><button type="submit">Apply filters</button></form>
    <div className="data-list">{applications.length === 0 ? <p className="empty-row">No applications match these filters.</p> : applications.map((application) => <article className="application-row" key={application.id}><div><strong>{application.full_name}</strong><p>{application.email}</p></div><div><span className="status-badge">{application.requested_role ?? application.account_status}</span><p>{application.departments?.[0]?.name ?? 'No department'}</p></div>{application.account_status === 'PENDING' && <form action={reviewApplication} className="row-actions"><input type="hidden" name="userId" value={application.id}/><button name="decision" value="APPROVED">Approve</button><button className="danger-action" name="decision" value="REJECTED">Reject</button></form>}</article>)}</div>
  </>
}
