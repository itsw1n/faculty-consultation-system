import { AccountPanel } from '@/components/layout/AccountPanel'
import { SubmitButton } from '@/components/common/SubmitButton'
import { signOut } from '@/features/auth/actions'

export default function Page() {
  return (
    <AccountPanel
      eyebrow="Application reviewed"
      title="Your application was not approved."
      description="Please contact the school administrator if you believe this needs review."
    >
      <form className="mt-6" action={signOut}>
        <SubmitButton pendingLabel="Signing out…">Sign out</SubmitButton>
      </form>
    </AccountPanel>
  )
}
