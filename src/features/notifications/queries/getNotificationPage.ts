'use server'
import { z } from 'zod'
import { requireApprovedProfile } from '@/features/auth/repositories/authRepository'
import { getNotificationPage as fetchNotificationPage } from '../repositories/notificationRepository'
const schema = z.object({
  cursor: z.object({ createdAt: z.iso.datetime(), id: z.uuid() }).nullable(),
})
export async function getNotificationPage(input: unknown) {
  await requireApprovedProfile()
  const value = schema.parse(input)
  return fetchNotificationPage(value.cursor ?? undefined)
}
