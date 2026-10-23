'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/lib/actionState'
import { availabilitySchema } from './schemas/availabilitySchema'

function availabilityError(
  error: { message: string },
  action: 'create' | 'update' | 'delete'
): string {
  if (error.message.includes('consultation history'))
    return action === 'delete'
      ? 'Availability with consultation history cannot be removed.'
      : 'Availability with consultation history cannot be changed.'
  if (error.message.includes('must start in the future'))
    return 'Availability must start in the future.'
  if (error.message.includes('overlap') || error.message.includes('availability_no_overlap'))
    return 'This time overlaps an existing slot.'
  if (error.message.includes('Approved faculty access required')) return 'Faculty access required.'
  if (action === 'create') return 'Check the availability details.'
  if (action === 'update') return 'Only open availability can be changed.'
  return 'Only open availability can be removed.'
}

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
  if (error) return { error: availabilityError(error, 'create') }
  revalidatePath('/faculty/availability')
  return { error: null, message: 'Availability added.' }
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
  if (error) return { error: availabilityError(error, 'update') }
  revalidatePath('/faculty/availability')
  return { error: null, message: 'Availability updated.' }
}
export async function deleteAvailability(formData: FormData) {
  await requireRole('FACULTY')
  const slotId = z.uuid().parse(formData.get('slotId'))
  const { error } = await (
    await createClient()
  ).rpc('delete_open_availability', { target_slot_id: slotId })
  if (error) throw new Error(availabilityError(error, 'delete'))
  revalidatePath('/faculty/availability')
}
