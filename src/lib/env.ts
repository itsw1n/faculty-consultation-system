import { z } from 'zod'

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
})

export function getPublicEnvironment() {
  return publicEnvironmentSchema.parse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  })
}

const serverEnvironmentSchema = z.object({
  INITIAL_ADMIN_EMAIL: z.email(),
})

export function getServerEnvironment() {
  return serverEnvironmentSchema.parse({
    INITIAL_ADMIN_EMAIL: process.env.INITIAL_ADMIN_EMAIL,
  })
}
