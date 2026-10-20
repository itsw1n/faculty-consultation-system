'use server'

import { redirect } from 'next/navigation'
import { getServerEnvironment } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/lib/actionState'
import {
  resetPasswordSchema,
  resetRequestSchema,
  signInSchema,
  signUpSchema,
} from './schemas/authSchema'

function formString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

export async function signInWithPassword(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formString(formData, 'email'),
    password: formString(formData, 'password'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check your details.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) {
    if (error.code === 'email_not_confirmed') {
      return { error: 'Please verify your email before signing in.' }
    }
    return { error: 'Incorrect email or password.' }
  }
  redirect('/auth/continue')
}

export async function signUpWithPassword(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    fullName: formString(formData, 'fullName'),
    email: formString(formData, 'email'),
    password: formString(formData, 'password'),
    confirmPassword: formString(formData, 'confirmPassword'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check your details.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  })
  if (error) {
    return { error: 'Unable to create the account. Try signing in instead.' }
  }
  return { error: null, message: 'Check your email to verify your account.' }
}

export async function requestPasswordReset(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetRequestSchema.safeParse({
    email: formString(formData, 'email'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Enter a valid email.' }
  }

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(parsed.data.email)
  return {
    error: null,
    message: 'If that email exists, a reset link is on its way.',
  }
}

export async function updatePassword(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formString(formData, 'password'),
    confirmPassword: formString(formData, 'confirmPassword'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check your details.' }
  }

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims?.sub) {
    return { error: 'Open the reset link from your email to continue.' }
  }
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })
  if (error) {
    return { error: 'Unable to update the password. Request a new reset link.' }
  }
  redirect('/auth/continue')
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
