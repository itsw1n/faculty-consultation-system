import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { ConsultationItem } from '../types'
export async function listMyConsultations(status?: ConsultationItem['consultation_status']) {
  const { data, error } = await (
    await createClient()
  ).rpc('list_my_consultations', { status_filter: status ?? null, result_limit: 50 })
  if (error) throw new Error('Unable to load consultations')
  return data as ConsultationItem[]
}
export async function getConsultationPage(filters: {
  search?: string
  status?: ConsultationItem['consultation_status']
  cursor?: { createdAt: string; id: string }
}) {
  const { data, error } = await (
    await createClient()
  ).rpc('search_my_consultations', {
    search_text: filters.search ?? '',
    status_filter: filters.status ?? null,
    cursor_created_at: filters.cursor?.createdAt ?? null,
    cursor_id: filters.cursor?.id ?? null,
    result_limit: 20,
  })
  if (error) throw new Error('Unable to load consultations')
  const items = data as ConsultationItem[]
  const last = items.at(-1)
  return {
    items,
    hasMore: items.length === 20,
    nextCursor: last ? { createdAt: last.created_at, id: last.id } : null,
  }
}
