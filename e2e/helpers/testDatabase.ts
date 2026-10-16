import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { supabaseAnonKey, supabaseServiceKey, supabaseUrl } from './environment'

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

export async function ensureFacultyProfile(
  userId: string,
  departmentId: string,
  positionTitle = 'Instructor I'
): Promise<void> {
  const service = getServiceClient()
  const { error: profileError } = await service
    .from('profiles')
    .update({ department_id: departmentId })
    .eq('id', userId)
  if (profileError) throw profileError
  const { error: facultyError } = await service
    .from('faculty_profiles')
    .upsert({ user_id: userId, position_title: positionTitle }, { onConflict: 'user_id' })
  if (facultyError) throw facultyError
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
  const departments = await getDepartments()
  const first = departments[0]
  if (!first) throw new Error('No departments seeded')
  return { id: first.id, name: first.name }
}

export async function getDepartments(): Promise<Array<{ id: string; name: string; code: string }>> {
  const { data, error } = await getServiceClient()
    .from('departments')
    .select('id, name, code')
    .order('name')
  if (error) throw error
  return data
}

export async function getDepartmentByCode(code: string): Promise<{ name: string } | null> {
  const { data, error } = await getServiceClient()
    .from('departments')
    .select('name')
    .eq('code', code)
    .maybeSingle()
  if (error) throw error
  return data
}

export function tomorrowIso(): string {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000)
  return date.toISOString().slice(0, 10)
}

export async function ensureSlot(
  facultyId: string,
  overrides: { date?: string; start_time?: string; end_time?: string; status?: string } = {}
): Promise<{ id: string }> {
  const { data, error } = await getServiceClient()
    .from('availability_slots')
    .insert({
      faculty_id: facultyId,
      date: overrides.date ?? tomorrowIso(),
      start_time: overrides.start_time ?? '09:00',
      end_time: overrides.end_time ?? '10:00',
      status: overrides.status ?? 'OPEN',
      mode: 'IN_PERSON',
      location: 'Room 101',
    })
    .select('id')
    .single()
  if (error) throw error
  return data
}

async function authenticatedClient(email: string, password: string): Promise<SupabaseClient> {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw error
  return client
}

/** Setup-only RPC calls. Clicks under test go through the UI; these build preconditions. */
export async function bookConsultationAs(
  email: string,
  password: string,
  slotId: string,
  purpose = 'ACADEMIC',
  notes: string | null = null
): Promise<string> {
  const client = await authenticatedClient(email, password)
  const { data, error } = await client.rpc('book_consultation', {
    target_slot_id: slotId,
    consultation_purpose: purpose,
    consultation_notes: notes,
  })
  if (error) throw error
  return data as string
}

export async function decideConsultationAs(
  email: string,
  password: string,
  consultationId: string,
  approve: boolean
): Promise<void> {
  const client = await authenticatedClient(email, password)
  const { error } = await client.rpc('decide_consultation', {
    target_consultation_id: consultationId,
    approve,
  })
  if (error) throw error
}

export async function cancelConsultationAs(
  email: string,
  password: string,
  consultationId: string
): Promise<void> {
  const client = await authenticatedClient(email, password)
  const { error } = await client.rpc('cancel_consultation', {
    target_consultation_id: consultationId,
  })
  if (error) throw error
}

export async function completeConsultationAs(
  email: string,
  password: string,
  consultationId: string,
  outcome: string | null = null
): Promise<void> {
  const client = await authenticatedClient(email, password)
  const { error } = await client.rpc('complete_consultation_with_outcome', {
    target_consultation_id: consultationId,
    outcome_text: outcome,
  })
  if (error) throw error
}

export async function getConsultation(id: string): Promise<{
  status: string
  outcome: string | null
} | null> {
  const { data, error } = await getServiceClient()
    .from('consultations')
    .select('status, outcome')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getLatestConsultationForStudent(
  studentId: string
): Promise<{ id: string; status: string } | null> {
  const { data, error } = await getServiceClient()
    .from('consultations')
    .select('id, status')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getSlot(id: string): Promise<{ status: string } | null> {
  const { data, error } = await getServiceClient()
    .from('availability_slots')
    .select('status')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getSlotsForFaculty(facultyId: string): Promise<
  Array<{
    id: string
    status: string
    location: string | null
    start_time: string
    end_time: string
  }>
> {
  const { data, error } = await getServiceClient()
    .from('availability_slots')
    .select('id, status, location, start_time, end_time')
    .eq('faculty_id', facultyId)
    .order('date')
    .order('start_time')
  if (error) throw error
  return data
}

export async function getNotifications(
  recipientId: string
): Promise<Array<{ type: string; read_at: string | null }>> {
  const { data, error } = await getServiceClient()
    .from('notifications')
    .select('type, read_at')
    .eq('recipient_id', recipientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function seedNotification(
  recipientId: string,
  overrides: { type?: string; title?: string; message?: string } = {}
): Promise<void> {
  const { error } = await getServiceClient()
    .from('notifications')
    .insert({
      recipient_id: recipientId,
      type: overrides.type ?? 'CONSULTATION_APPROVED',
      title: overrides.title ?? 'Consultation approved',
      message: overrides.message ?? 'Your consultation schedule is confirmed.',
      entity_type: 'consultation',
    })
  if (error) throw error
}

export async function setAccountStatus(
  userId: string,
  accountStatus: 'PENDING' | 'REJECTED' | 'APPROVED'
): Promise<void> {
  const update =
    accountStatus === 'APPROVED'
      ? { account_status: accountStatus }
      : { account_status: accountStatus, role: null }
  const { error } = await getServiceClient().from('profiles').update(update).eq('id', userId)
  if (error) throw error
}

export async function setDepartment(userId: string, departmentId: string): Promise<void> {
  const { error } = await getServiceClient()
    .from('profiles')
    .update({ department_id: departmentId })
    .eq('id', userId)
  if (error) throw error
}
