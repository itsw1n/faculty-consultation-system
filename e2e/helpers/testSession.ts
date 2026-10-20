import { createClient } from '@supabase/supabase-js'
import type { Page } from '@playwright/test'
import { supabaseAnonKey, supabaseUrl } from './environment'

const MAX_CHUNK_SIZE = 3180

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function splitChunks(key: string, encoded: string): Array<{ name: string; value: string }> {
  if (encoded.length <= MAX_CHUNK_SIZE) return [{ name: key, value: encoded }]
  const chunks: string[] = []
  let rest = encoded
  while (rest.length > 0) {
    let head = rest.slice(0, MAX_CHUNK_SIZE)
    const lastEscape = head.lastIndexOf('%')
    if (lastEscape > MAX_CHUNK_SIZE - 3) head = head.slice(0, lastEscape)
    let decoded = ''
    while (head.length > 0) {
      try {
        decoded = decodeURIComponent(head)
        break
      } catch {
        head = head.slice(0, head.length - 3)
      }
    }
    chunks.push(decoded)
    rest = rest.slice(head.length)
  }
  return chunks.map((value, index) => ({ name: `${key}.${index}`, value }))
}

function storageKeyFor(url: string): string {
  const hostname = new URL(url).hostname
  return `sb-${hostname.split('.')[0]}-auth-token`
}

/**
 * Signs in with email + password through the real GoTrue API, then writes
 * the session into the browser using the exact cookie format the app's
 * Supabase SSR client reads. This keeps setup fast for specs that are not
 * exercising the sign-in form itself.
 */
export async function signInAs(page: Page, email: string, password: string): Promise<void> {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error || !data.session) throw error ?? new Error(`Sign-in failed for ${email}`)
  const encoded = `base64-${toBase64Url(JSON.stringify(data.session))}`
  const key = storageKeyFor(supabaseUrl)
  // The suite runs against 127.0.0.1, so cookies must be scoped there.
  const cookies = splitChunks(key, encodeURIComponent(encoded)).map((cookie) => ({
    ...cookie,
    domain: '127.0.0.1',
    path: '/',
  }))
  await page.context().addCookies(cookies)
}
