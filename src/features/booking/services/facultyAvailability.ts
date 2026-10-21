import { z } from 'zod'
import type { SlotResult } from '../types'

export const facultyIdSchema = z.uuid()

export const availabilityRangeSchema = z
  .object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .refine((range) => range.start <= range.end, { message: 'Invalid availability range.' })

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
  if (deps.listSlots) return deps.listSlots(id, deps.start, deps.end)
  const { listFacultySlots } = await import('../repositories/bookingRepository')
  return listFacultySlots(id, deps.start, deps.end)
}
