'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { createClient } from '@/lib/supabase/server'

const reviewSchema = z.object({ userId: z.uuid(), decision: z.enum(['APPROVED', 'REJECTED']) })
export async function reviewApplication(formData: FormData) {
  await requireRole('ADMIN')
  const input = reviewSchema.parse({
    userId: formData.get('userId'),
    decision: formData.get('decision'),
  })
  const { error } = await (
    await createClient()
  ).rpc('review_application', { target_user_id: input.userId, decision: input.decision })
  if (error) throw new Error('The application could not be reviewed. Refresh and try again.')
  revalidatePath('/admin/users')
}

export async function reviewApplications(formData: FormData) {
  await requireRole('ADMIN')
  const userIds = z.array(z.uuid()).min(1).max(50).parse(formData.getAll('userIds'))
  const decision = z.enum(['APPROVED', 'REJECTED']).parse(formData.get('decision'))
  const { data, error } = await (
    await createClient()
  ).rpc('review_applications', { target_user_ids: userIds, decision })
  if (error) throw new Error('The selected applications could not be reviewed.')
  const failures = (data as { succeeded: boolean }[]).filter((item) => !item.succeeded).length
  if (failures)
    throw new Error(
      `${failures} application records changed before this review. Refresh and try again.`
    )
  revalidatePath('/admin/users')
}
