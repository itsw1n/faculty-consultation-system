import { PageHeading } from '@/components/common/PageHeading'
import { ApplicationReviewList } from '@/features/applications/components/ApplicationReviewList'
import { getApplicationPage } from '@/features/applications/repositories/applicationRepository'
import { getDepartments } from '@/features/auth/repositories/authRepository'

export default async function ManageUsersPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; role?: string; department?: string }> }) {
  const parameters = await searchParams
  const [page, departments] = await Promise.all([getApplicationPage({ ...parameters, status: parameters.status ?? 'PENDING' }), getDepartments()])
  return <><PageHeading title="Manage Users" description="Review student and faculty access applications."/>
    <form className="filter-bar"><label><span>Search</span><input name="search" defaultValue={parameters.search} placeholder="Search name or email"/></label><label><span>Status</span><select name="status" defaultValue={parameters.status ?? 'PENDING'}><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option><option value="">All</option></select></label><label><span>Role</span><select name="role" defaultValue={parameters.role}><option value="">All</option><option value="STUDENT">Student</option><option value="FACULTY">Faculty</option></select></label><label><span>Department</span><select name="department" defaultValue={parameters.department}><option value="">All</option>{departments.map(item=><option value={item.id} key={item.id}>{item.code}</option>)}</select></label><button type="submit">Apply</button></form>
    <ApplicationReviewList initialPage={page} filters={{search:parameters.search??'',status:parameters.status??'PENDING',role:parameters.role??'',department:parameters.department??''}}/>
  </>
}
