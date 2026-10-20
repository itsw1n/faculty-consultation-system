import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

const allowedTypes = new Set<EmailOtpType>(['email', 'signup', 'recovery'])

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const nextParam = searchParams.get('next')
  const next = nextParam && nextParam.startsWith('/') ? nextParam : '/auth/continue'

  if (!tokenHash || !type || !allowedTypes.has(type)) {
    redirect('/?error=verify')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
  if (error) {
    redirect('/?error=verify')
  }
  redirect(next)
}
