import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getPublicEnvironment } from '@/lib/env'

export async function createClient() {
  const environment = getPublicEnvironment()
  const store = await cookies()
  return createServerClient(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (values) => {
          try {
            values.forEach(({ name, value, options }) => store.set(name, value, options))
          } catch {
            /* Proxy owns refresh writes. */
          }
        },
      },
    }
  )
}
