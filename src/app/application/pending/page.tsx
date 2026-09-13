import { signOut } from '@/features/auth/actions'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'

export default function PendingPage() {
  return (
    <main>
      <Section className="grid min-h-screen place-items-center">
        <Container>
          <div className="mx-auto w-full max-w-2xl rounded-xl border border-border bg-surface p-8 text-center shadow-card sm:p-12">
            <p className="text-6xl" aria-hidden="true">
              ⌛
            </p>
            <p className="mt-3 text-xs font-bold tracking-[0.12em] text-primary uppercase">
              Application submitted
            </p>
            <h1 className="my-3 text-3xl font-bold sm:text-4xl">
              Your application is pending approval.
            </h1>
            <p className="text-muted">
              We’ll notify you when an administrator has reviewed your application.
            </p>
            <form className="mx-auto mt-8 max-w-64" action={signOut}>
              <button className="min-h-11 w-full rounded-lg bg-primary px-4 font-bold text-white hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-focus">
                Sign out
              </button>
            </form>
          </div>
        </Container>
      </Section>
    </main>
  )
}
