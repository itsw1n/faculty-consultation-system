import { readFileSync } from 'node:fs'
import { join } from 'node:path'

function loadDotenvFile(path: string): void {
  let raw: string
  try {
    raw = readFileSync(path, 'utf8')
  } catch {
    return
  }
  for (const line of raw.split('\n')) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!match || process.env[match[1]] !== undefined) continue
    let value = match[2] ?? ''
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[match[1]] = value
  }
}

const root = process.cwd()
loadDotenvFile(join(root, '.env.local'))
loadDotenvFile(join(root, '.env'))

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'

export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''

export const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

/**
 * Database-backed specs need a local Supabase with a service-role key.
 * CI runs the suite without one, so those specs skip there and the
 * landing-page specs still run.
 */
export function databaseTestsEnabled(): boolean {
  if (process.env.CI) return false
  return supabaseUrl.length > 0 && supabaseAnonKey.length > 0 && supabaseServiceKey.length > 0
}
