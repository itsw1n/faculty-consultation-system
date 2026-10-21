import { SubmitButton } from '@/components/common/SubmitButton'
import { signOut } from '@/features/auth/actions'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'

export default function RejectedPage() {
  return (
    <main>
      <Section className="grid min-h-screen place-items-center">
        <Container>
          <div className="mx-auto w-full max-w-2xl rounded-lg border border-border bg-surface p-8 text-center sm:p-12">
            <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">
              Application reviewed
            </p>
            <h1 className="my-3 text-3xl font-bold sm:text-4xl">
              Your application was not approved.
            </h1>
            <p className="text-muted">
              Please contact the school administrator if you believe this needs review.
            </p>
            <form className="mx-auto mt-8 max-w-64" action={signOut}>
              <SubmitButton pendingLabel="Signing out…">Sign out</SubmitButton>
            </form>
          </div>
        </Container>
      </Section>
    </main>
  )
}
