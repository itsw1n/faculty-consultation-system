import { describe, expect, test } from 'vitest'
import { bulkReviewSchema, reviewDecisionSchema } from './reviewSchema'

const userId = '11111111-1111-4111-8111-111111111111'

describe('reviewDecisionSchema', () => {
  test('accepts an approval for a user', () => {
    expect(reviewDecisionSchema.safeParse({ userId, decision: 'APPROVED' }).success).toBe(true)
  })

  test('rejects an unknown decision', () => {
    expect(reviewDecisionSchema.safeParse({ userId, decision: 'MAYBE' }).success).toBe(false)
  })

  test('rejects a non-uuid user', () => {
    expect(reviewDecisionSchema.safeParse({ userId: 'nope', decision: 'APPROVED' }).success).toBe(
      false
    )
  })
})

describe('bulkReviewSchema', () => {
  test('accepts one to fifty users', () => {
    expect(bulkReviewSchema.safeParse({ userIds: [userId], decision: 'REJECTED' }).success).toBe(
      true
    )
  })

  test('rejects an empty selection and an oversized one', () => {
    expect(bulkReviewSchema.safeParse({ userIds: [], decision: 'REJECTED' }).success).toBe(false)
    expect(
      bulkReviewSchema.safeParse({ userIds: Array(51).fill(userId), decision: 'REJECTED' }).success
    ).toBe(false)
  })
})
