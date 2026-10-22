import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { ApplicationItem } from '../types'
export type ApplicationFilters = {
  search?: string
  role?: string
  department?: string
  cursor?: { createdAt: string; id: string }
}

export async function getAccountCounts() {
  const supabase = await createClient()
  const [total, students, faculty, admins] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
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
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'ADMIN')
      .eq('account_status', 'APPROVED'),
  ])
  if (total.error || students.error || faculty.error || admins.error)
    throw new Error('Unable to load account counts')
  return {
    total: total.count ?? 0,
    students: students.count ?? 0,
    faculty: faculty.count ?? 0,
    admins: admins.count ?? 0,
  }
}
export async function getApplicationPage(filters: ApplicationFilters) {
  const { data, error } = await (
    await createClient()
  ).rpc('list_application_page', {
    search_text: filters.search ?? '',
    status_filter: 'APPROVED',
    role_filter: filters.role || null,
    department_filter: filters.department || null,
    cursor_created_at: filters.cursor?.createdAt ?? null,
    cursor_id: filters.cursor?.id ?? null,
    result_limit: 20,
  })
  if (error) throw new Error('Unable to load applications')
  const items = data as ApplicationItem[]
  const last = items.at(-1)
  return {
    items,
    hasMore: items.length === 20,
    nextCursor: last ? { createdAt: last.created_at, id: last.id } : null,
  }
}
