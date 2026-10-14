'use server'
import { z } from 'zod'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { getFacultyPage as fetchFacultyPage } from '../repositories/bookingRepository'
const inputSchema = z.object({
  search: z.string().max(160),
  departmentId: z.union([z.uuid(), z.literal('')]),
  cursor: z.object({ name: z.string(), id: z.uuid() }).nullable(),
})
export async function getFacultyPage(input: unknown) {
  await requireRole('STUDENT')
  const value = inputSchema.parse(input)
  return fetchFacultyPage(value.search, value.departmentId, value.cursor ?? undefined)
}
