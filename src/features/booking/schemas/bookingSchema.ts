import { z } from 'zod'

export const bookingSchema = z.object({
  slotId: z.uuid(),
  purpose: z.enum(['GRADE', 'CAPSTONE', 'ACADEMIC', 'PERSONAL', 'OTHER']),
  notes: z.string().trim().max(2000).optional(),
})

export type BookingInput = z.infer<typeof bookingSchema>
