import { z } from 'zod'

export const accountCorrectionSchema = z.object({
  userId: z.uuid(),
  role: z.enum(['STUDENT', 'FACULTY']),
  departmentId: z.uuid(),
  positionTitle: z.string().trim().max(120).optional(),
})
