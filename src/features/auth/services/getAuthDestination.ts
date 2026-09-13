import type { AuthProfile } from '@/features/auth/types'

export function getAuthDestination(profile: AuthProfile | null) {
  if (!profile) return '/'
  if (!profile.accountStatus) return '/apply'
  if (profile.accountStatus === 'PENDING') return '/application/pending'
  if (profile.accountStatus === 'REJECTED') return '/application/rejected'
  if (profile.role === 'STUDENT') return '/student'
  if (profile.role === 'FACULTY') return '/faculty'
  if (profile.role === 'ADMIN') return '/admin'
  return '/'
}
