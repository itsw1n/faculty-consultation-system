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
    .select('account_status,email,full_name,role,position_title,departments(name)')
    .eq('id', userId)
    .single()

  if (error) return null

  const currentEmail = claimsData.claims.email
  if (typeof currentEmail !== 'string') return null
  const { data: allowed, error: domainError } = await supabase.rpc('is_approved_email', {
    candidate_email: currentEmail,
  })
  if (domainError || !allowed) return null

  return {
    id: userId,
    accountStatus: data.account_status,
    email: data.email,
    fullName: data.full_name,
    departmentName: data.departments?.[0]?.name ?? null,
    positionTitle: data.position_title,
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
