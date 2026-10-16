import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { supabaseServiceKey, supabaseUrl } from './environment'

let serviceClient: SupabaseClient | null = null

export function getServiceClient(): SupabaseClient {
  if (!serviceClient) {
    serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return serviceClient
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@acdeducation.com`
}

export type TestAccount = { id: string; email: string; password: string }

export async function ensureAccount(
  email: string,
  password: string,
  fullName: string
): Promise<TestAccount> {
  const service = getServiceClient()
  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  const userId = created.user?.id
  if (createError || !userId) {
    const { data: listed } = await service.auth.admin.listUsers()
    const existing = listed.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())
    if (!existing) throw createError ?? new Error(`Unable to create test account ${email}`)
    return { id: existing.id, email, password }
  }
  return { id: userId, email, password }
}

export async function setProfile(
  userId: string,
  profile: { role: 'ADMIN' | 'STUDENT' | 'FACULTY'; account_status: 'APPROVED' }
): Promise<void> {
  const { error } = await getServiceClient()
    .from('profiles')
    .update({ role: profile.role, account_status: profile.account_status })
    .eq('id', userId)
  if (error) throw error
}

export async function getProfileByEmail(email: string): Promise<{
  id: string
  role: string | null
  account_status: string | null
} | null> {
  const { data, error } = await getServiceClient()
    .from('profiles')
    .select('id, role, account_status')
    .eq('email', email)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getFacultyProfile(
  userId: string
): Promise<{ position_title: string | null } | null> {
  const { data, error } = await getServiceClient()
    .from('faculty_profiles')
    .select('position_title')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getInviteByEmail(email: string): Promise<{ email: string } | null> {
  const { data, error } = await getServiceClient()
    .from('faculty_invites')
    .select('email')
    .eq('email', email)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getFirstDepartment(): Promise<{ id: string; name: string }> {
  const { data, error } = await getServiceClient()
    .from('departments')
    .select('id, name')
    .order('name')
    .limit(1)
    .single()
  if (error) throw error
  return data
}
