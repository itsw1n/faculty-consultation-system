import { redirect } from 'next/navigation'
import { submitApplication } from '@/features/auth/actions'
import { getAuthenticatedProfile, getDepartments } from '@/features/auth/repositories/authRepository'

export default async function ApplyPage() {
  const profile = await getAuthenticatedProfile()
  if (!profile) redirect('/')
  if (profile.accountStatus) redirect('/auth/continue')
  const departments = await getDepartments()
  return <main className="form-page"><section className="form-card">
    <p className="eyebrow">Get started</p><h1>Choose your application type</h1><p>Your role request will be reviewed by an administrator.</p>
    <form action={submitApplication} className="application-form">
      <label>Full name<input value={profile.fullName} readOnly /></label><label>School email<input value={profile.email} readOnly /></label>
      <label>Apply as<select name="requestedRole" required><option value="">Select a role</option><option value="STUDENT">Student</option><option value="FACULTY">Faculty</option></select></label>
      <label>Department<select name="departmentId" required><option value="">Select a department</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.code} — {department.name}</option>)}</select></label>
      <label>Position title <span>(faculty only)</span><input name="positionTitle" maxLength={120} /></label>
      <button className="primary-button" type="submit">Submit application</button>
    </form>
  </section></main>
}
