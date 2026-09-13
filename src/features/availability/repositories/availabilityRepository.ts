import 'server-only'
import { createClient } from '@/lib/supabase/server'

export async function listOwnAvailability() {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims?.sub
  if (!userId) return []
  const { data, error } = await supabase.from('availability_slots').select('id,date,start_time,end_time,status,mode,location,meeting_link').eq('faculty_id', userId).gte('date', new Date().toISOString().slice(0, 10)).order('date').order('start_time').limit(60)
  if (error) throw new Error('Unable to load availability')
  return data
}
