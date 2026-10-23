'use server'
import { z } from 'zod'
import { requireApprovedProfile } from '@/features/auth/repositories/authRepository'
import { cursorSchema } from '@/lib/pagination'
import { getNotificationPage as fetchNotificationPage } from '../repositories/notificationRepository'
const schema = z.object({ cursor: cursorSchema })
export async function getNotificationPage(input: unknown) {
  const profile = await requireApprovedProfile()
  const value = schema.parse(input)
  return fetchNotificationPage(profile.id, value.cursor ?? undefined)
}
