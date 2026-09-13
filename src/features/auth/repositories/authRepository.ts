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
    .select('account_status,email,full_name,requested_role,role')
    .eq('id', userId)
    .single()

  if (error) return null

  return {
    accountStatus: data.account_status,
    email: data.email,
    fullName: data.full_name,
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

export async function getDepartments() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('departments').select('id,code,name').order('name')
  if (error) throw new Error('Unable to load departments')
  return data
}
