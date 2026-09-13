'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/features/auth/repositories/authRepository'
import { createClient } from '@/lib/supabase/server'

const departmentSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(20)
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2).max(120),
})

const departmentUpdateSchema = departmentSchema.extend({ id: z.string().uuid() })

export async function createDepartment(formData: FormData) {
  await requireRole('ADMIN')
  const input = departmentSchema.parse({ code: formData.get('code'), name: formData.get('name') })
  const { error } = await (await createClient()).from('departments').insert(input)
  if (error) throw new Error('Department code and name must be unique.')
  revalidatePath('/admin/departments')
}

export async function updateDepartment(formData: FormData) {
  await requireRole('ADMIN')
  const input = departmentUpdateSchema.parse({
    id: formData.get('id'),
    code: formData.get('code'),
    name: formData.get('name'),
  })
  const { error } = await (await createClient())
    .from('departments')
    .update({ code: input.code, name: input.name })
    .eq('id', input.id)
  if (error) throw new Error('Department code and name must be unique.')
  revalidatePath('/admin/departments')
}
