import 'server-only'
import { createClient } from '@/lib/supabase/server'
export async function listDepartments(){const{data,error}=await(await createClient()).from('departments').select('id,code,name').order('code');if(error)throw new Error('Unable to load departments');return data}
export async function listFacultyRecords(search=''){const supabase=await createClient();let query=supabase.from('profiles').select('id,full_name,email,account_status,departments(code,name),faculty_profiles(position_title)').eq('role','FACULTY').order('full_name').limit(50);if(search.trim())query=query.or(`full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`);const{data,error}=await query;if(error)throw new Error('Unable to load faculty');return data}
