import { z } from 'zod'

export const bookingSchema = z.object({
  slotId: z.uuid(),
  category: z.enum(['GRADE', 'CAPSTONE', 'ACADEMIC', 'PERSONAL', 'OTHER']),
  notes: z.string().trim().max(2000).optional(),
})
