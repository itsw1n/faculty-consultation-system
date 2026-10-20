import { describe, expect, test } from 'vitest'
import { resetPasswordSchema, signInSchema, signUpSchema } from './authSchema'

const valid = {
  fullName: 'Maria Cruz',
  email: 'maria@acdeducation.com',
  password: 'Password123!',
  confirmPassword: 'Password123!',
}

describe('authSchema', () => {
  test('accepts a complete sign-up', () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true)
  })

  test('rejects a short password', () => {
    expect(
      signUpSchema.safeParse({ ...valid, password: 'short', confirmPassword: 'short' }).success
    ).toBe(false)
  })

  test('rejects mismatched passwords', () => {
    expect(signUpSchema.safeParse({ ...valid, confirmPassword: 'Different123!' }).success).toBe(
      false
    )
  })

  test('rejects an invalid email', () => {
    expect(signUpSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false)
  })

  test('sign-in accepts any non-empty password', () => {
    expect(signInSchema.safeParse({ email: valid.email, password: 'x' }).success).toBe(true)
  })

  test('reset requires matching passwords', () => {
    expect(
      resetPasswordSchema.safeParse({
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }).success
    ).toBe(true)
    expect(
      resetPasswordSchema.safeParse({ password: 'Password123!', confirmPassword: 'no' }).success
    ).toBe(false)
  })
})
