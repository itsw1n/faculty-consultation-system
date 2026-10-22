import 'server-only'
import { createClient } from '@/lib/supabase/server'
export async function listDepartments() {
  const { data, error } = await (await createClient())
    .from('departments')
    .select('id,code,name')
    .order('name')
  if (error) throw new Error('Unable to load departments')
  return data
}
