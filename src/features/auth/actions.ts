'use server'

import { redirect } from 'next/navigation'
import { getPublicEnvironment, getServerEnvironment } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/lib/actionState'

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

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function claimFirstAdmin(_state: ActionState): Promise<ActionState> {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims?.sub
  if (!userId) return { error: 'Authentication is required.' }
  let environment: { INITIAL_ADMIN_EMAIL: string }
  try {
    environment = getServerEnvironment()
  } catch {
    return { error: 'Admin bootstrap is not configured.' }
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()
  if (
    !profile?.email ||
    profile.email.toLowerCase() !== environment.INITIAL_ADMIN_EMAIL.toLowerCase()
  )
    return { error: 'Admin claim is not available for this account.' }
  const { error } = await supabase.rpc('claim_first_admin', {
    expected_email: environment.INITIAL_ADMIN_EMAIL,
  })
  if (error) return { error: 'Admin claim is not available for this account.' }
  redirect('/admin')
}
