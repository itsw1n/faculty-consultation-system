import { redirect } from 'next/navigation'
import { AccountPanel } from '@/components/layout/AccountPanel'
import { getAuthenticatedProfile } from '@/features/auth/repositories/authRepository'
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'

export default async function ResetPasswordPage() {
  const profile = await getAuthenticatedProfile()
  if (!profile) redirect('/')

  return (
    <AccountPanel
      eyebrow="Password recovery"
      title="Choose a new password."
      description="Use at least eight characters."
    >
      <ResetPasswordForm />
    </AccountPanel>
  )
}
