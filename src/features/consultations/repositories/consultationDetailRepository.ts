import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { ConsultationCategory } from '../categories'

export type ConsultationDetail = {
  id: string
  student_name: string
  faculty_name: string
  category: ConsultationCategory
  description: string | null
  outcome: string | null
  consultation_status: string
  slot_date: string
  start_time: string
  end_time: string
  mode: string
  location: string | null
  meeting_link: string | null
}

export async function getConsultationDetail(id: string) {
  const { data, error } = await (
    await createClient()
  ).rpc('get_consultation_detail', { target_id: id })
  if (error) throw new Error('Unable to load consultation')
  return (data?.[0] ?? null) as ConsultationDetail | null
}
