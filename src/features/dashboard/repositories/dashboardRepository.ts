import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { ConsultationItem } from '@/features/consultations/types'

type AdminDashboardSummary = {
  students: number
  faculty: number
  consultations: number
  pending: number
  approved: number
  completed: number
  rejected: number
  cancelled: number
  open_slots: number
  faculty_without_future_slots: number
}
export async function getStudentDashboard() {
  const supabase = await createClient()
  const [pending, upcoming, recent] = await Promise.all([
    supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING'),
    supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'APPROVED'),
    supabase
      .from('consultations')
      .select('id,purpose,status,created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])
  return { pending: pending.count ?? 0, upcoming: upcoming.count ?? 0, recent: recent.data ?? [] }
}
export async function getFacultyDashboard() {
  const supabase = await createClient()
  const [pending, upcoming, openSlots] = await Promise.all([
    supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING'),
    supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'APPROVED'),
    supabase.rpc('count_own_open_availability'),
  ])
  return {
    pending: pending.count ?? 0,
    upcoming: upcoming.count ?? 0,
    openSlots: Number(openSlots.data ?? 0),
  }
}
export async function getAdminDashboard() {
  const supabase = await createClient()
  const [summary, recent] = await Promise.all([
    supabase.rpc('admin_dashboard_summary').single(),
    supabase.rpc('search_my_consultations', {
      search_text: '',
      status_filter: null,
      cursor_created_at: null,
      cursor_id: null,
      result_limit: 5,
    }),
  ])
  if (summary.error || recent.error || !summary.data)
    throw new Error('Unable to load the admin dashboard')
  return {
    ...(summary.data as AdminDashboardSummary),
    recent: (recent.data ?? []) as ConsultationItem[],
  }
}
