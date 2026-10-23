'use server'
import { revalidatePath } from 'next/cache'
import { requireApprovedProfile } from '@/features/auth/repositories/authRepository'
import { createClient } from '@/lib/supabase/server'
import { notificationIdSchema } from './schemas/notificationSchema'
export async function markNotificationRead(formData: FormData) {
  const profile = await requireApprovedProfile()
  const id = notificationIdSchema.parse(formData.get('notificationId'))
  const { error } = await (await createClient())
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', profile.id)
    .eq('id', id)
    .is('read_at', null)
  if (error) throw new Error('Unable to update notification')
  revalidatePath('/notifications')
}
export async function markAllNotificationsRead() {
  const profile = await requireApprovedProfile()
  const { error } = await (await createClient())
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', profile.id)
    .is('read_at', null)
  if (error) throw new Error('Unable to update notifications')
  revalidatePath('/notifications')
}
