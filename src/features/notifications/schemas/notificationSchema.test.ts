import { describe, expect, test } from 'vitest'
import { notificationIdSchema } from './notificationSchema'

describe('notificationIdSchema', () => {
  test('accepts a uuid', () => {
    expect(notificationIdSchema.safeParse('11111111-1111-4111-8111-111111111111').success).toBe(
      true
    )
  })

  test('rejects a non-uuid', () => {
    expect(notificationIdSchema.safeParse('not-an-id').success).toBe(false)
  })
})
