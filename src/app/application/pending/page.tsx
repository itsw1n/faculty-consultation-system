import { AccountPanel } from '@/components/layout/AccountPanel'
import { SubmitButton } from '@/components/common/SubmitButton'
import { signOut } from '@/features/auth/actions'

export default function Page() {
  return (
    <AccountPanel
      eyebrow="Application submitted"
      title="Your application is pending approval."
      description="We’ll notify you when an administrator has reviewed your application."
    >
      <form className="mt-6" action={signOut}>
        <SubmitButton pendingLabel="Signing out…">Sign out</SubmitButton>
      </form>
    </AccountPanel>
  )
}
