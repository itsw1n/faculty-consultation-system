import type { AuthProfile, UserRole } from '@/features/auth/types'

export type RoleAccess = { ok: true; profile: AuthProfile } | { ok: false; status: 401 | 403 }

export type AuthContext = {
  userId: string | null
  profile: AuthProfile | null
}

export function evaluateRoleAccess(context: AuthContext, role: UserRole): RoleAccess {
  if (!context.userId) return { ok: false, status: 401 }
  if (!context.profile) return { ok: false, status: 403 }

  const isApproved = context.profile.accountStatus === 'APPROVED'
  const hasRequiredRole = context.profile.role === role

  if (!isApproved || !hasRequiredRole) return { ok: false, status: 403 }

  return { ok: true, profile: context.profile }
}
