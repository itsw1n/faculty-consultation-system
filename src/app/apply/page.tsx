import { redirect } from 'next/navigation'
import { getAuthenticatedProfile, getDepartments } from '@/features/auth/repositories/authRepository'
import { ApplicationFlow } from '@/features/auth/components/ApplicationFlow'

export default async function ApplyPage() {
  const profile = await getAuthenticatedProfile()
  if (!profile) redirect('/')
  if (profile.accountStatus) redirect('/auth/continue')
  const departments = await getDepartments()
  return <main className="form-page"><ApplicationFlow fullName={profile.fullName} email={profile.email} departments={departments}/></main>
}
