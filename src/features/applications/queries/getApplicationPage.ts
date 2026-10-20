'use server'
import { z } from 'zod'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { getApplicationPage as fetchApplicationPage } from '../repositories/applicationRepository'
const schema = z.object({
  search: z.string().max(200),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).nullable(),
  role: z.enum(['STUDENT', 'FACULTY', 'ADMIN']).nullable(),
  department: z.uuid().nullable(),
  cursor: z.object({ createdAt: z.iso.datetime(), id: z.uuid() }).nullable(),
})
export async function getApplicationPage(input: unknown) {
  await requireRole('ADMIN')
  const value = schema.parse(input)
  return fetchApplicationPage({
    search: value.search,
    status: value.status ?? '',
    role: value.role ?? '',
    department: value.department ?? '',
    cursor: value.cursor ?? undefined,
  })
}
