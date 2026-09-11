import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { AuthProfile } from '@/features/auth/types'

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

export async function getDepartments() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('departments').select('id,code,name').order('name')
  if (error) throw new Error('Unable to load departments')
  return data
}
