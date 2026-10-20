import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { RequestResetForm } from '@/features/auth/components/RequestResetForm'

export default function ForgotPasswordPage() {
  return (
    <main>
      <Section className="grid min-h-screen place-items-center">
        <Container>
          <div className="mx-auto w-full max-w-lg rounded-xl border border-border bg-surface p-8 shadow-card sm:p-12">
            <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">
              Password recovery
            </p>
            <h1 className="my-3 text-3xl font-bold sm:text-4xl">Forgot your password?</h1>
            <p className="text-muted">Enter your school email and we will send a reset link.</p>
            <RequestResetForm />
          </div>
        </Container>
      </Section>
    </main>
  )
}
