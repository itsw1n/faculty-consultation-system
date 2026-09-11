'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getPublicEnvironment } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'

const applicationSchema = z.object({
  requestedRole: z.enum(['STUDENT', 'FACULTY']),
  departmentId: z.uuid(),
  positionTitle: z.string().trim().max(120).optional(),
}).superRefine((value, context) => {
  if (value.requestedRole === 'FACULTY' && !value.positionTitle) {
    context.addIssue({ code: 'custom', path: ['positionTitle'], message: 'Position title is required.' })
  }
})

export async function signInWithGoogle() {
  const supabase = await createClient()
  const environment = getPublicEnvironment()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${environment.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  })
  if (error || !data.url) redirect('/?error=signin')
  redirect(data.url)
}

export async function submitApplication(formData: FormData) {
  const result = applicationSchema.safeParse({
    requestedRole: formData.get('requestedRole'),
    departmentId: formData.get('departmentId'),
    positionTitle: formData.get('positionTitle') || undefined,
  })
  if (!result.success) redirect('/apply?error=invalid')

  const supabase = await createClient()
  const { error } = await supabase.rpc('submit_application', {
    requested_role: result.data.requestedRole,
    selected_department_id: result.data.departmentId,
    faculty_position_title: result.data.positionTitle ?? null,
  })
  if (error) redirect('/apply?error=submit')
  redirect('/application/pending')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
