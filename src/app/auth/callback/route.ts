import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.redirect(new URL('/?error=callback', request.url))
  const { error } = await (await createClient()).auth.exchangeCodeForSession(code)
  return NextResponse.redirect(new URL(error ? '/?error=callback' : '/auth/continue', request.url))
}
