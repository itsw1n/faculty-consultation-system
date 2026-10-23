import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { AuthProfile } from '@/features/auth/types'
import type { UserRole } from '@/features/auth/types'
import {
  evaluateRoleAccess,
  type AuthContext,
  type RoleAccess,
} from '@/features/auth/services/roleAccess'
import { departmentName } from '@/features/auth/services/departmentName'

const loadAuthContext = cache(async (): Promise<AuthContext> => {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (claimsError || !claimsData || typeof userId !== 'string')
    return { userId: null, profile: null }

  const { data, error } = await supabase
    .from('profiles')
    .select('account_status,email,full_name,role,position_title,departments(name)')
    .eq('id', userId)
    .single()

  if (error) return { userId, profile: null }

  const currentEmail = claimsData.claims.email
  if (typeof currentEmail !== 'string') return { userId, profile: null }
  const { data: allowed, error: domainError } = await supabase.rpc('is_approved_email', {
    candidate_email: currentEmail,
  })
  if (domainError || !allowed) return { userId, profile: null }

  return {
    userId,
    profile: {
      id: userId,
      accountStatus: data.account_status,
      email: data.email,
      fullName: data.full_name,
      departmentName: departmentName(data.departments),
      positionTitle: data.position_title,
      role: data.role,
    },
  }
})

export async function getAuthenticatedProfile(): Promise<AuthProfile | null> {
  return (await loadAuthContext()).profile
}

export async function authorizeRole(role: UserRole): Promise<RoleAccess> {
  return evaluateRoleAccess(await loadAuthContext(), role)
}

export async function requireRole(role: UserRole): Promise<AuthProfile> {
  const context = await loadAuthContext()
  if (!context.profile) redirect('/')
  const result = evaluateRoleAccess(context, role)
  if (!result.ok) redirect('/auth/continue')
  return result.profile
}

export async function requireApprovedProfile(): Promise<AuthProfile> {
  const profile = await getAuthenticatedProfile()
  if (!profile || profile.accountStatus !== 'APPROVED') throw new Error('Authentication required')
  return profile
}
