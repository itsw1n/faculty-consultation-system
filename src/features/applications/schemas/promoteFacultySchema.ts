import { z } from 'zod'

export const promoteFacultySchema = z.object({
  email: z.email().trim().toLowerCase(),
  departmentId: z.uuid(),
  positionTitle: z.string().trim().min(1).max(120),
})
