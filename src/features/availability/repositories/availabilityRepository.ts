import 'server-only'
import { createClient } from '@/lib/supabase/server'
export type AvailabilityItem={id:string;date:string;start_time:string;end_time:string;status:'OPEN'|'RESERVED'|'BOOKED'|'CLOSED';mode:'IN_PERSON'|'ONLINE';location:string|null;meeting_link:string|null}

export async function listOwnAvailability() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('list_own_availability')
  if (error) throw new Error('Unable to load availability')
  return data as AvailabilityItem[]
}
