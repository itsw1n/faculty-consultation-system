'use server'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/lib/actionState'
import { accountCorrectionSchema } from './schemas/accountCorrectionSchema'
import { promoteFacultySchema } from './schemas/promoteFacultySchema'

export async function promoteFaculty(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole('ADMIN')
  const result = promoteFacultySchema.safeParse({
    email: formData.get('email'),
    departmentId: formData.get('departmentId'),
    positionTitle: formData.get('positionTitle') || undefined,
  })
  if (!result.success)
    return { error: result.error.issues[0]?.message ?? 'Check the faculty details.' }
  const input = result.data
  const { data, error } = await (
    await createClient()
  ).rpc('promote_registered_faculty', {
    target_email: input.email,
    new_department_id: input.departmentId,
    new_position_title: input.positionTitle,
  })
  if (error) return { error: 'The account could not be updated. Refresh and try again.' }
  const outcomes: Record<string, string> = {
    DOMAIN_NOT_ALLOWED: 'This email domain is not allowed.',
    NOT_REGISTERED: 'Ask this person to register and verify their email first.',
    NOT_VERIFIED: 'Ask this person to verify their email first.',
    ALREADY_FACULTY: 'This account is already faculty. Use Edit User to change its details.',
    NOT_ELIGIBLE: 'Only an active Student account can be promoted to Faculty.',
  }
  if (data !== 'PROMOTED')
    return { error: outcomes[String(data)] ?? 'The account could not be updated.' }
  revalidatePath('/admin/users')
  return { error: null, message: `${input.email} is now a Faculty account.` }
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
  if (error) {
    if (error.message.includes('Resolve active Faculty work first'))
      return { error: 'Resolve this Faculty member’s open slots and consultations first.' }
    if (error.message.includes('Email verification is required'))
      return { error: 'Ask this person to verify their email first.' }
    return { error: 'The account could not be updated. Refresh and try again.' }
  }
  revalidatePath('/admin/users')
  return { error: null, message: 'Account updated.' }
}
