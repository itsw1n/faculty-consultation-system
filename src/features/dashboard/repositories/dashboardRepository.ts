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
export type FacultyDashboardSummary = {
  pending: number
  open_slots: number
  next_open_date: string | null
  next_open_start_time: string | null
  next_open_end_time: string | null
}

export async function getFacultyDashboard() {
  const supabase = await createClient()
  const [summary, requests, agenda] = await Promise.all([
    supabase.rpc('faculty_dashboard_summary').single(),
    supabase.rpc('search_my_consultations', {
      search_text: '',
      status_filter: 'PENDING',
      cursor_created_at: null,
      cursor_id: null,
      result_limit: 3,
    }),
    supabase.rpc('list_my_upcoming_consultations', { result_limit: 5 }),
  ])
  if (summary.error || requests.error || agenda.error || !summary.data)
    throw new Error('Unable to load the faculty dashboard')
  return {
    summary: summary.data as FacultyDashboardSummary,
    requests: (requests.data ?? []) as ConsultationItem[],
    agenda: (agenda.data ?? []) as ConsultationItem[],
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
