import { describe, expect, test } from 'vitest'
import { reportRangeSchema } from './reportRangeSchema'

describe('reportRangeSchema', () => {
  test('accepts a 366-day inclusive range', () => {
    expect(reportRangeSchema.safeParse({ from: '2026-01-01', to: '2027-01-01' }).success).toBe(true)
  })

  test('rejects a range longer than 366 inclusive days', () => {
    expect(reportRangeSchema.safeParse({ from: '2026-01-01', to: '2027-01-02' }).success).toBe(
      false
    )
  })

  test('rejects reversed and invalid dates', () => {
    expect(reportRangeSchema.safeParse({ from: '2026-02-01', to: '2026-01-01' }).success).toBe(
      false
    )
    expect(reportRangeSchema.safeParse({ from: '2026-02-30', to: '2026-03-01' }).success).toBe(
      false
    )
  })
})
