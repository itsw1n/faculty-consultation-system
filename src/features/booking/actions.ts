'use server'
import { redirect } from 'next/navigation'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/lib/actionState'
import { bookingSchema } from './schemas/bookingSchema'
export async function bookConsultation(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole('STUDENT')
  const result = bookingSchema.safeParse({
    slotId: formData.get('slotId'),
    purpose: formData.get('purpose'),
    notes: formData.get('notes') || undefined,
  })
  if (!result.success) return { error: 'Check the consultation details.' }
  const input = result.data
  const { error } = await (
    await createClient()
  ).rpc('book_consultation', {
    target_slot_id: input.slotId,
    consultation_purpose: input.purpose,
    consultation_notes: input.notes ?? null,
  })
  if (error) return { error: 'This time is no longer available. Choose another slot.' }
  redirect('/student/consultations')
}
