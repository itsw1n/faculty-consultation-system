import { describe, expect, test } from 'vitest'
import { bookingSchema } from './bookingSchema'

const valid = {
  slotId: '11111111-1111-4111-8111-111111111111',
  purpose: 'PERSONAL',
} as const

describe('bookingSchema', () => {
  test('accepts a valid booking with optional notes', () => {
    expect(bookingSchema.safeParse({ ...valid, notes: 'Need help' }).success).toBe(true)
  })

  test('rejects an unknown purpose', () => {
    expect(bookingSchema.safeParse({ ...valid, purpose: 'CHAT' }).success).toBe(false)
  })

  test('rejects notes over the limit', () => {
    expect(bookingSchema.safeParse({ ...valid, notes: 'x'.repeat(2001) }).success).toBe(false)
  })

  test('rejects a non-uuid slot', () => {
    expect(bookingSchema.safeParse({ ...valid, slotId: 'nope' }).success).toBe(false)
  })
})
