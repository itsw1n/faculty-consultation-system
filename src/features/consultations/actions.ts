'use server'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { createClient } from '@/lib/supabase/server'
import { deliverEmails } from '@/features/email/services/deliverEmails'
import type { ActionState } from '@/lib/actionState'
import {
  approvalDecisionSchema,
  consultationIdSchema,
  outcomeSchema,
} from './schemas/consultationSchema'
const refresh = () => {
  revalidatePath('/faculty')
  revalidatePath('/faculty/requests')
  revalidatePath('/faculty/consultations')
  revalidatePath('/student')
  revalidatePath('/student/consultations')
}
export async function decideConsultation(formData: FormData) {
  await requireRole('FACULTY')
  const id = consultationIdSchema.parse(formData.get('consultationId'))
  const approve = approvalDecisionSchema.parse(formData.get('approve')) === 'true'
  const { error } = await (
    await createClient()
  ).rpc('decide_consultation', { target_consultation_id: id, approve })
  if (error) throw new Error('The request state changed. Refresh and try again.')
  refresh()
  await deliverEmails().catch(() => {})
}
export async function cancelConsultation(formData: FormData) {
  await requireRole('STUDENT')
  const id = consultationIdSchema.parse(formData.get('consultationId'))
  const { error } = await (
    await createClient()
  ).rpc('cancel_consultation', { target_consultation_id: id })
  if (error) throw new Error('This consultation can no longer be cancelled.')
  refresh()
  await deliverEmails().catch(() => {})
}
export async function completeConsultationWithFeedback(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const error = await completeConsultationRecord(formData)
  if (error) return { error }
  refresh()
  return { error: null, message: 'Consultation marked as completed.' }
}

async function completeConsultationRecord(formData: FormData): Promise<string | null> {
  await requireRole('FACULTY')
  const id = consultationIdSchema.safeParse(formData.get('consultationId'))
  const outcome = outcomeSchema.safeParse(formData.get('outcome') ?? '')
  if (!id.success || !outcome.success) return 'Check the outcome note and try again.'
  const { error } = await (
    await createClient()
  ).rpc('complete_consultation_with_outcome', {
    target_consultation_id: id.data,
    outcome_text: outcome.data || null,
  })
  if (error) return 'This consultation cannot be completed. Refresh and try again.'
  return null
}
