import 'server-only'
import { createClient } from '@/lib/supabase/server'
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
  const [students, faculty, consultations] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'STUDENT')
      .eq('account_status', 'APPROVED'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'FACULTY')
      .eq('account_status', 'APPROVED'),
    supabase.rpc('admin_consultation_count'),
  ])
  return {
    students: students.count ?? 0,
    faculty: faculty.count ?? 0,
    consultations: Number(consultations.data ?? 0),
  }
}
