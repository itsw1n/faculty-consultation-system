import { AccountPanel } from '@/components/layout/AccountPanel'
import { SignUpForm } from '@/features/auth/components/SignUpForm'

export default function Page() {
  return (
    <AccountPanel
      eyebrow="New account"
      title="Create your account."
      description="Use your school email. You will verify it before signing in."
    >
      <SignUpForm />
    </AccountPanel>
  )
}
