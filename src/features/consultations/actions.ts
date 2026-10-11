'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { createClient } from '@/lib/supabase/server'
import { deliverEmails } from '@/features/email/services/deliverEmails'
const idSchema = z.uuid()
const refresh = () => {
  revalidatePath('/faculty/requests')
  revalidatePath('/faculty/consultations')
  revalidatePath('/student/consultations')
  revalidatePath('/faculty/consultations/[id]', 'page')
  revalidatePath('/student/consultations/[id]', 'page')
}
export async function decideConsultation(formData: FormData) {
  await requireRole('FACULTY')
  const id = idSchema.parse(formData.get('consultationId'))
  const approve = z.enum(['true', 'false']).parse(formData.get('approve')) === 'true'
  const { error } = await (
    await createClient()
  ).rpc('decide_consultation', { target_consultation_id: id, approve })
  if (error) throw new Error('The request state changed. Refresh and try again.')
  refresh()
  await deliverEmails().catch(() => {})
}
export async function cancelConsultation(formData: FormData) {
  await requireRole('STUDENT')
  const id = idSchema.parse(formData.get('consultationId'))
  const { error } = await (
    await createClient()
  ).rpc('cancel_consultation', { target_consultation_id: id })
  if (error) throw new Error('This consultation can no longer be cancelled.')
  refresh()
  await deliverEmails().catch(() => {})
}
export async function completeConsultation(formData: FormData) {
  await requireRole('FACULTY')
  const id = idSchema.parse(formData.get('consultationId'))
  const outcome = z
    .string()
    .trim()
    .max(2000)
    .parse(formData.get('outcome') ?? '')
  const { error } = await (
    await createClient()
  ).rpc('complete_consultation_with_outcome', {
    target_consultation_id: id,
    outcome_text: outcome || null,
  })
  if (error) throw new Error('This consultation cannot be completed.')
  refresh()
}
