import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { addDays, manilaDateKey } from '@/lib/manilaTime'
import type { FacultyResult, SlotResult } from '../types'
export type { FacultyResult }
export async function getFacultyPage(
  search = '',
  departmentId?: string,
  cursor?: { name: string; id: string }
) {
  const { data, error } = await (
    await createClient()
  ).rpc('list_faculty_page', {
    faculty_search: search,
    department_filter: departmentId || null,
    cursor_name: cursor?.name ?? null,
    cursor_id: cursor?.id ?? null,
    result_limit: 20,
  })
  if (error) throw new Error('Unable to load faculty')
  const items = data as FacultyResult[]
  const last = items.at(-1)
  return {
    items,
    hasMore: items.length === 20,
    nextCursor: last ? { name: last.full_name, id: last.id } : null,
  }
}
export async function listFacultySlots(facultyId: string, start?: string, end?: string) {
  const rangeStart = start ?? manilaDateKey()
  const rangeEnd = end ?? addDays(rangeStart, 28)
  const { data, error } = await (
    await createClient()
  ).rpc('list_faculty_slots', {
    target_faculty_id: facultyId,
    range_start: rangeStart,
    range_end: rangeEnd,
  })
  if (error) throw new Error('Unable to load schedules')
  return data as SlotResult[]
}
