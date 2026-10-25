import { beforeEach, expect, test, vi } from 'vitest'

const { rpc, signUp, redirect } = vi.hoisted(() => ({
  rpc: vi.fn(),
  signUp: vi.fn(),
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
}))

vi.mock('next/navigation', () => ({ redirect }))
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ rpc, auth: { signUp } })),
}))

import { signUpWithPassword } from './actions'

function signupForm() {
  const form = new FormData()
  form.set('fullName', 'Demo Student')
  form.set('email', 'demo@acdeducation.com')
  form.set('password', 'Password123!')
  form.set('confirmPassword', 'Password123!')
  return form
}

beforeEach(() => {
  vi.clearAllMocks()
  rpc.mockResolvedValue({ data: true, error: null })
})

test('sign-up with an immediate session continues into the app', async () => {
  signUp.mockResolvedValue({ data: { session: { access_token: 'test' } }, error: null })

  await expect(signUpWithPassword({ error: null }, signupForm())).rejects.toThrow('NEXT_REDIRECT')
  expect(redirect).toHaveBeenCalledWith('/auth/continue')
})

test('sign-up requiring confirmation tells the user to check email', async () => {
  signUp.mockResolvedValue({ data: { session: null }, error: null })

  await expect(signUpWithPassword({ error: null }, signupForm())).resolves.toEqual({
    error: null,
    message: 'Check your email to verify your account.',
  })
})

test('school-domain rejection prevents Auth account creation', async () => {
  rpc.mockResolvedValue({ data: false, error: null })

  await expect(signUpWithPassword({ error: null }, signupForm())).resolves.toEqual({
    error: 'Use an approved school email address.',
  })
  expect(signUp).not.toHaveBeenCalled()
})
