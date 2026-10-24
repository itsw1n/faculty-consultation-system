import { AccountPanel } from '@/components/layout/AccountPanel'
import { ClaimAdminForm } from '@/features/auth/components/ClaimAdminForm'

export default function Page() {
  return (
    <AccountPanel
      eyebrow="First administrator"
      title="Claim administrator access."
      description="Only the designated school account can claim this, and only once. Anyone else sees an error and nothing changes."
    >
      <ClaimAdminForm />
    </AccountPanel>
  )
}
