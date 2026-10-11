import { z } from 'zod'
import type { SlotResult } from '../types'

export const facultyIdSchema = z.uuid()

export async function getFacultyAvailability(
  facultyId: unknown,
  deps: { listSlots?: (id: string) => Promise<SlotResult[]> } = {}
): Promise<SlotResult[]> {
  const id = facultyIdSchema.parse(facultyId)
  if (deps.listSlots) return deps.listSlots(id)
  const { listFacultySlots } = await import('../repositories/bookingRepository')
  return listFacultySlots(id)
}
