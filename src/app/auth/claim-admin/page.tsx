import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { ClaimAdminForm } from '@/features/auth/components/ClaimAdminForm'

export default function ClaimAdminPage() {
  return (
    <main>
      <Section className="grid min-h-screen place-items-center">
        <Container>
          <div className="mx-auto w-full max-w-2xl rounded-xl border border-border bg-surface p-8 text-center shadow-card sm:p-12">
            <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">
              First administrator
            </p>
            <h1 className="my-3 text-3xl font-bold sm:text-4xl">Claim administrator access.</h1>
            <p className="text-muted">
              Only the designated school account can claim this, and only once. Anyone else sees an
              error and nothing changes.
            </p>
            <ClaimAdminForm />
          </div>
        </Container>
      </Section>
    </main>
  )
}
