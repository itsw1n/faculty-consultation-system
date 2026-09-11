'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { createClient } from '@/lib/supabase/server'

const reviewSchema = z.object({ userId: z.uuid(), decision: z.enum(['APPROVED', 'REJECTED']) })
export async function reviewApplication(formData: FormData) {
  await requireRole('ADMIN')
  const input = reviewSchema.parse({ userId: formData.get('userId'), decision: formData.get('decision') })
  const { error } = await (await createClient()).rpc('review_application', { target_user_id: input.userId, decision: input.decision })
  if (error) throw new Error('The application could not be reviewed. Refresh and try again.')
  revalidatePath('/admin/users')
}
