import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { AuthProfile } from '@/features/auth/types'
import type { UserRole } from '@/features/auth/types'
import { redirect } from 'next/navigation'

export async function getAuthenticatedProfile(): Promise<AuthProfile | null> {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (claimsError || !userId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'account_status,email,full_name,requested_role,role,departments(name),faculty_profiles(position_title)'
    )
    .eq('id', userId)
    .single()

  if (error) return null

  return {
    accountStatus: data.account_status,
    email: data.email,
    fullName: data.full_name,
    departmentName: data.departments?.[0]?.name ?? null,
    positionTitle: data.faculty_profiles?.[0]?.position_title ?? null,
    requestedRole: data.requested_role,
    role: data.role,
  }
}

export async function requireRole(role: UserRole): Promise<AuthProfile> {
  const profile = await getAuthenticatedProfile()
  if (!profile) redirect('/')
  if (profile.accountStatus !== 'APPROVED' || profile.role !== role) redirect('/auth/continue')
  return profile
}

export async function requireApprovedProfile(): Promise<AuthProfile> {
  const profile = await getAuthenticatedProfile()
  if (!profile || profile.accountStatus !== 'APPROVED') throw new Error('Authentication required')
  return profile
}
