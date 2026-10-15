'use server'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/lib/actionState'
import { accountCorrectionSchema } from './schemas/accountCorrectionSchema'
import { inviteFacultySchema } from './schemas/inviteFacultySchema'

export type InviteResult = { email: string; invited: boolean; reason: string | null }

export async function inviteFaculty(
  _state: ActionState,
  formData: FormData
): Promise<ActionState & { results?: InviteResult[] }> {
  await requireRole('ADMIN')
  const result = inviteFacultySchema.safeParse({
    emails: formData.get('emails'),
    departmentId: formData.get('departmentId'),
    positionTitle: formData.get('positionTitle') || undefined,
  })
  if (!result.success)
    return { error: result.error.issues[0]?.message ?? 'Check the invite details.' }
  const input = result.data
  const { data, error } = await (
    await createClient()
  ).rpc('invite_faculty', {
    invite_emails: input.emails,
    invite_department_id: input.departmentId,
    invite_position_title: input.positionTitle,
  })
  if (error) return { error: 'The invites could not be saved. Refresh and try again.' }
  revalidatePath('/admin/users')
  return { error: null, results: data as InviteResult[] }
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
