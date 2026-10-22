import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { ConsultationItem } from '@/features/consultations/types'
import { selectRecentConsultations } from '@/features/dashboard/dashboardUtils'

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

export type StudentDashboardSummary = {
  pending: number
  upcoming: number
  completed: number
  next_consultation_id: string | null
  next_faculty_name: string | null
  next_faculty_department: string | null
  next_purpose: string | null
  next_slot_date: string | null
  next_start_time: string | null
  next_end_time: string | null
  next_mode: ConsultationItem['mode'] | null
  next_location: string | null
}

export async function getStudentDashboard() {
  const supabase = await createClient()
  const [summary, pending, recent] = await Promise.all([
    supabase.rpc('student_dashboard_summary').single(),
    supabase.rpc('search_my_consultations', {
      search_text: '',
      status_filter: 'PENDING',
      cursor_created_at: null,
      cursor_id: null,
      result_limit: 3,
    }),
    supabase.rpc('search_my_consultations', {
      search_text: '',
      status_filter: null,
      cursor_created_at: null,
      cursor_id: null,
      result_limit: 50,
    }),
  ])
  if (summary.error || pending.error || recent.error || !summary.data)
    throw new Error('Unable to load the student dashboard')

  const data = summary.data as StudentDashboardSummary
  const pendingItems = (pending.data ?? []) as ConsultationItem[]
  const excluded = new Set(pendingItems.map((item) => item.id))
  if (data.next_consultation_id) excluded.add(data.next_consultation_id)
  const recentItems = selectRecentConsultations(
    (recent.data ?? []) as ConsultationItem[],
    excluded,
    3
  )

  return { summary: data, pending: pendingItems, recent: recentItems }
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
