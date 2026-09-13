'use server'
import { z } from 'zod'
import { getAuthenticatedProfile } from '@/features/auth/repositories/authRepository'
import { getConsultationPage } from './repositories/consultationRepository'
const status = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'])
const schema = z.object({
  search: z.string().max(200),
  status: status.nullable(),
  cursor: z.object({ createdAt: z.iso.datetime(), id: z.uuid() }).nullable(),
})
export async function loadConsultationPage(input: unknown) {
  const profile = await getAuthenticatedProfile()
  if (!profile || profile.accountStatus !== 'APPROVED') throw new Error('Authentication required')
  const value = schema.parse(input)
  return getConsultationPage({
    search: value.search,
    status: value.status ?? undefined,
    cursor: value.cursor ?? undefined,
  })
}
