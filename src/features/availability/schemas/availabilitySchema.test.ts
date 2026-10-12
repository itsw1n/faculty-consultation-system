import { describe, expect, test } from 'vitest'
import { availabilitySchema } from './availabilitySchema'

const valid = {
  date: '2026-10-20',
  startTime: '09:00',
  endTime: '10:00',
  mode: 'IN_PERSON',
  location: 'Room 101',
} as const

describe('availabilitySchema', () => {
  test('accepts a valid in-person slot', () => {
    expect(availabilitySchema.safeParse(valid).success).toBe(true)
  })

  test('accepts an online slot without a location', () => {
    const { location: _omitted, ...online } = { ...valid, mode: 'ONLINE' as const }
    expect(availabilitySchema.safeParse(online).success).toBe(true)
  })

  test('rejects an end time that is not later than the start', () => {
    const result = availabilitySchema.safeParse({ ...valid, endTime: '09:00' })
    expect(result.success).toBe(false)
  })

  test('rejects an in-person slot without a location', () => {
    const { location: _omitted, ...noLocation } = valid
    const result = availabilitySchema.safeParse(noLocation)
    expect(result.success).toBe(false)
  })

  test('rejects a non-date string', () => {
    expect(availabilitySchema.safeParse({ ...valid, date: 'not-a-date' }).success).toBe(false)
  })
})
