'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/lib/actionState'
import { availabilitySchema } from './schemas/availabilitySchema'
export async function createAvailability(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole('FACULTY')
  const result = availabilitySchema.safeParse({
    date: formData.get('date'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    mode: formData.get('mode'),
    location: formData.get('location') || undefined,
    meetingLink: formData.get('meetingLink') || undefined,
  })
  if (!result.success)
    return { error: result.error.issues[0]?.message ?? 'Check the availability details.' }
  const input = result.data
  const { error } = await (
    await createClient()
  ).rpc('create_availability', {
    slot_date: input.date,
    slot_start_time: input.startTime,
    slot_end_time: input.endTime,
    slot_mode: input.mode,
    slot_location: input.location ?? null,
    slot_meeting_link: input.meetingLink || null,
  })
  if (error) return { error: 'Availability overlaps an existing slot or contains invalid details.' }
  revalidatePath('/faculty/availability')
  return { error: null }
}
export async function updateAvailability(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole('FACULTY')
  const slotId = formData.get('slotId')
  if (typeof slotId !== 'string' || !z.uuid().safeParse(slotId).success)
    return { error: 'Check the availability details.' }
  const result = availabilitySchema.safeParse({
    date: formData.get('date'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    mode: formData.get('mode'),
    location: formData.get('location') || undefined,
    meetingLink: formData.get('meetingLink') || undefined,
  })
  if (!result.success)
    return { error: result.error.issues[0]?.message ?? 'Check the availability details.' }
  const input = result.data
  const { error } = await (
    await createClient()
  ).rpc('update_open_availability', {
    target_slot_id: slotId,
    slot_date: input.date,
    slot_start_time: input.startTime,
    slot_end_time: input.endTime,
    slot_mode: input.mode,
    slot_location: input.location ?? null,
    slot_meeting_link: input.meetingLink || null,
  })
  if (error) return { error: 'Only open availability can be changed.' }
  revalidatePath('/faculty/availability')
  return { error: null }
}
export async function deleteAvailability(formData: FormData) {
  await requireRole('FACULTY')
  const slotId = z.uuid().parse(formData.get('slotId'))
  const { error } = await (
    await createClient()
  ).rpc('delete_open_availability', { target_slot_id: slotId })
  if (error) throw new Error('Only open availability can be removed.')
  revalidatePath('/faculty/availability')
}
