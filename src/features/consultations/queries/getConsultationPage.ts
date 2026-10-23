'use server'
import { z } from 'zod'
import { requireApprovedProfile } from '@/features/auth/repositories/authRepository'
import { cursorSchema } from '@/lib/pagination'
import { getConsultationPage as fetchConsultationPage } from '../repositories/consultationRepository'
const status = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'])
const schema = z.object({
  search: z.string().max(200),
  status: status.nullable(),
  cursor: cursorSchema,
})
export async function getConsultationPage(input: unknown) {
  await requireApprovedProfile()
  const value = schema.parse(input)
  return fetchConsultationPage({
    search: value.search,
    status: value.status ?? undefined,
    cursor: value.cursor ?? undefined,
  })
}
