import { z } from 'zod'

const emailListSchema = z
  .string()
  .transform((value) =>
    value
      .split(/[,\n]/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
  )
  .pipe(z.array(z.string().trim().min(3).max(320)).min(1).max(50))

export const inviteFacultySchema = z.object({
  emails: emailListSchema,
  departmentId: z.uuid(),
  positionTitle: z.string().trim().min(1).max(120),
})

export type InviteFacultyInput = z.infer<typeof inviteFacultySchema>
