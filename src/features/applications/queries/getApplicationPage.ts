'use server'
import { z } from 'zod'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { cursorSchema } from '@/lib/pagination'
import { getApplicationPage as fetchApplicationPage } from '../repositories/applicationRepository'
const schema = z.object({
  search: z.string().max(200),
  role: z.enum(['STUDENT', 'FACULTY', 'ADMIN']).nullable(),
  department: z.uuid().nullable(),
  cursor: cursorSchema,
})
export async function getApplicationPage(input: unknown) {
  await requireRole('ADMIN')
  const value = schema.parse(input)
  return fetchApplicationPage({
    search: value.search,
    role: value.role ?? '',
    department: value.department ?? '',
    cursor: value.cursor ?? undefined,
  })
}
