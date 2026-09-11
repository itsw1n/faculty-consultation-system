import 'server-only'
import { createClient } from '@/lib/supabase/server'

export async function listApplications(search = '', status = 'PENDING') {
  const supabase = await createClient()
  let query = supabase.from('profiles').select('id,full_name,email,requested_role,account_status,departments(code,name)').order('created_at', { ascending: false }).limit(20)
  if (status) query = query.eq('account_status', status)
  if (search.trim()) query = query.or(`full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`)
  const { data, error } = await query
  if (error) throw new Error('Unable to load applications')
  return data
}
