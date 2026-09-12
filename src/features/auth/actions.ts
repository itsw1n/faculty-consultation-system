'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getPublicEnvironment } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/lib/actionState'

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

export async function submitApplication(_state: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims?.sub
  if (!userId) return { error: 'Authentication is required.' }
  const { data: profile } = await supabase.from('profiles').select('account_status').eq('id', userId).single()
  if (!profile || profile.account_status) return { error: 'This account cannot submit a new application.' }
  const result = applicationSchema.safeParse({
    requestedRole: formData.get('requestedRole'),
    departmentId: formData.get('departmentId'),
    positionTitle: formData.get('positionTitle') || undefined,
  })
  if (!result.success) return { error: result.error.issues[0]?.message ?? 'Check the application details.' }

  const { error } = await supabase.rpc('submit_application', {
    requested_role: result.data.requestedRole,
    selected_department_id: result.data.departmentId,
    faculty_position_title: result.data.positionTitle ?? null,
  })
  if (error) return { error: 'The application could not be submitted. Refresh and try again.' }
  redirect('/application/pending')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
