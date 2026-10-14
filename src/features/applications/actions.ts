'use server'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/lib/actionState'
import { accountCorrectionSchema } from './schemas/accountCorrectionSchema'
import { bulkReviewSchema, reviewDecisionSchema } from './schemas/reviewSchema'

export async function reviewApplication(formData: FormData) {
  await requireRole('ADMIN')
  const input = reviewDecisionSchema.parse({
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
  const { userIds, decision } = bulkReviewSchema.parse({
    userIds: formData.getAll('userIds'),
    decision: formData.get('decision'),
  })
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

export async function correctUserAccount(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole('ADMIN')
  const result = accountCorrectionSchema.safeParse({
    userId: formData.get('userId'),
    role: formData.get('role'),
    departmentId: formData.get('departmentId'),
    positionTitle: formData.get('positionTitle') || undefined,
  })
  if (!result.success)
    return { error: result.error.issues[0]?.message ?? 'Check the account details.' }
  const input = result.data
  const { error } = await (
    await createClient()
  ).rpc('correct_user_account', {
    target_user_id: input.userId,
    new_role: input.role,
    new_department_id: input.departmentId,
    position_title: input.positionTitle ?? null,
  })
  if (error) return { error: 'The account could not be corrected. Refresh and try again.' }
  revalidatePath('/admin/users')
  return { error: null }
}
