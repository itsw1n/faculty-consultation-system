import { describe, expect, test } from 'vitest'
import { approvalDecisionSchema, consultationIdSchema, outcomeSchema } from './consultationSchema'

describe('consultationSchema', () => {
  test('accepts a uuid consultation id', () => {
    expect(consultationIdSchema.safeParse('11111111-1111-4111-8111-111111111111').success).toBe(
      true
    )
  })

  test('rejects a non-uuid consultation id', () => {
    expect(consultationIdSchema.safeParse('nope').success).toBe(false)
  })

  test('accepts only true/false approval decisions', () => {
    expect(approvalDecisionSchema.safeParse('true').success).toBe(true)
    expect(approvalDecisionSchema.safeParse('false').success).toBe(true)
    expect(approvalDecisionSchema.safeParse('yes').success).toBe(false)
  })

  test('accepts an outcome within the limit', () => {
    expect(outcomeSchema.safeParse('Follow up next week').success).toBe(true)
    expect(outcomeSchema.safeParse('x'.repeat(2001)).success).toBe(false)
  })
})
