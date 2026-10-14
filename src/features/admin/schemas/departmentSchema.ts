import { z } from 'zod'

export const departmentSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(20)
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2).max(120),
})

export const departmentUpdateSchema = departmentSchema.extend({ id: z.string().uuid() })

export type DepartmentInput = z.infer<typeof departmentSchema>
