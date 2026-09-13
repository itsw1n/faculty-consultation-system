import { redirect } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { ApplicationFlow } from '@/features/auth/components/ApplicationFlow'
import {
  getAuthenticatedProfile,
  getDepartments,
} from '@/features/auth/repositories/authRepository'

export default async function ApplyPage() {
  const profile = await getAuthenticatedProfile()
  if (!profile) redirect('/')
  if (profile.accountStatus) redirect('/auth/continue')
  const departments = await getDepartments()
  return (
    <main className="grid min-h-screen place-items-center">
      <Section className="w-full">
        <Container>
          <ApplicationFlow
            fullName={profile.fullName}
            email={profile.email}
            departments={departments}
          />
        </Container>
      </Section>
    </main>
  )
}
