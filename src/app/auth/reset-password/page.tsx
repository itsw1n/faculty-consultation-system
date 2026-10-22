import { redirect } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { getAuthenticatedProfile } from '@/features/auth/repositories/authRepository'
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'

export default async function ResetPasswordPage() {
  const profile = await getAuthenticatedProfile()
  if (!profile) redirect('/')

  return (
    <main>
      <Section className="grid min-h-screen place-items-center">
        <Container>
          <div className="mx-auto w-full max-w-lg rounded-lg border border-border bg-surface p-8 sm:p-12">
            <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">
              Password recovery
            </p>
            <h1 className="my-3 text-3xl font-bold sm:text-4xl">Choose a new password.</h1>
            <p className="text-muted">Use at least eight characters.</p>
            <ResetPasswordForm />
          </div>
        </Container>
      </Section>
    </main>
  )
}
