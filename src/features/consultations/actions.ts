'use server'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { createClient } from '@/lib/supabase/server'
import { deliverEmails } from '@/features/email/services/deliverEmails'
import {
  approvalDecisionSchema,
  consultationIdSchema,
  outcomeSchema,
} from './schemas/consultationSchema'
const refresh = () => {
  revalidatePath('/faculty/requests')
  revalidatePath('/faculty/consultations')
  revalidatePath('/student/consultations')
  revalidatePath('/faculty/consultations/[id]', 'page')
  revalidatePath('/student/consultations/[id]', 'page')
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
export async function completeConsultation(formData: FormData) {
  await requireRole('FACULTY')
  const id = consultationIdSchema.parse(formData.get('consultationId'))
  const outcome = outcomeSchema.parse(formData.get('outcome') ?? '')
  const { error } = await (
    await createClient()
  ).rpc('complete_consultation_with_outcome', {
    target_consultation_id: id,
    outcome_text: outcome || null,
  })
  if (error) throw new Error('This consultation cannot be completed.')
  refresh()
}
