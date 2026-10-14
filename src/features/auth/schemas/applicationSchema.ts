import { z } from 'zod'

export const applicationSchema = z
  .object({
    requestedRole: z.enum(['STUDENT', 'FACULTY']),
    departmentId: z.uuid(),
    positionTitle: z.string().trim().max(120).optional(),
  })
  .superRefine((value, context) => {
    if (value.requestedRole === 'FACULTY' && !value.positionTitle) {
      context.addIssue({
        code: 'custom',
        path: ['positionTitle'],
        message: 'Position title is required.',
      })
    }
  })

export type ApplicationInput = z.infer<typeof applicationSchema>
