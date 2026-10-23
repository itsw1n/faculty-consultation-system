import { z } from 'zod'
import { addDays, manilaDateKey } from '@/lib/manilaTime'
import type { SlotResult } from '../types'

export const facultyIdSchema = z.uuid()

const MAX_AVAILABILITY_DAYS = 62

export const availabilityRangeSchema = z
  .object({ start: z.iso.date(), end: z.iso.date() })
  .refine((range) => range.start <= range.end, { message: 'Invalid availability range.' })
  .refine(
    (range) =>
      (Date.parse(`${range.end}T00:00:00Z`) - Date.parse(`${range.start}T00:00:00Z`)) / 86_400_000 +
        1 <=
      MAX_AVAILABILITY_DAYS,
    { message: 'Invalid availability range.' }
  )

type AvailabilityDeps = {
  start?: string
  end?: string
  listSlots?: (id: string, start?: string, end?: string) => Promise<SlotResult[]>
}

export async function getFacultyAvailability(
  facultyId: unknown,
  deps: AvailabilityDeps = {}
): Promise<SlotResult[]> {
  const id = facultyIdSchema.parse(facultyId)
  const start = deps.start ?? manilaDateKey()
  const end = deps.end ?? addDays(start, 28)
  if (deps.listSlots) return deps.listSlots(id, start, end)
  const { listFacultySlots } = await import('../repositories/bookingRepository')
  return listFacultySlots(id, start, end)
}
