import { redirect } from 'next/navigation'
import { getAuthenticatedProfile } from '@/features/auth/repositories/authRepository'
import { getAuthDestination } from '@/features/auth/services/getAuthDestination'

export default async function AuthContinuePage() {
  redirect(getAuthDestination(await getAuthenticatedProfile()))
}
