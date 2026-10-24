import { AccountPanel } from '@/components/layout/AccountPanel'
import { RequestResetForm } from '@/features/auth/components/RequestResetForm'

export default function Page() {
  return (
    <AccountPanel
      eyebrow="Password recovery"
      title="Forgot your password?"
      description="Enter your school email and we will send a reset link."
    >
      <RequestResetForm />
    </AccountPanel>
  )
}
