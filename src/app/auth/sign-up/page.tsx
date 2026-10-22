import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { SignUpForm } from '@/features/auth/components/SignUpForm'

export default function SignUpPage() {
  return (
    <main>
      <Section className="grid min-h-screen place-items-center">
        <Container>
          <div className="mx-auto w-full max-w-lg rounded-lg border border-border bg-surface p-8 sm:p-12">
            <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">
              New account
            </p>
            <h1 className="my-3 text-3xl font-bold sm:text-4xl">Create your account.</h1>
            <p className="text-muted">
              Use your school email. You will verify it before signing in.
            </p>
            <SignUpForm />
          </div>
        </Container>
      </Section>
    </main>
  )
}
