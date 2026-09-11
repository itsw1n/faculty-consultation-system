import 'server-only'
import { createClient } from '@/lib/supabase/server'

export async function listApplications(filters: { search?: string; status?: string; role?: string; department?: string }) {
  const supabase = await createClient()
  let query = supabase.from('profiles').select('id,full_name,email,requested_role,account_status,departments(code,name)').order('created_at', { ascending: false }).limit(20)
  if (filters.status) query = query.eq('account_status', filters.status)
  if (filters.role) query = query.eq('requested_role', filters.role)
  if (filters.department) query = query.eq('department_id', filters.department)
  if (filters.search?.trim()) query = query.or(`full_name.ilike.%${filters.search.trim()}%,email.ilike.%${filters.search.trim()}%`)
  const { data, error } = await query
  if (error) throw new Error('Unable to load applications')
  return data
}
