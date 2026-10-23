import { describe, expect, test } from 'vitest'
import { cursorSchema } from './pagination'

describe('cursorSchema', () => {
  test('accepts PostgREST UTC timestamps with an offset', () => {
    const result = cursorSchema.safeParse({
      createdAt: '2026-10-21T09:48:42.512685+00:00',
      id: '11111111-1111-4111-8111-111111111111',
    })
    expect(result.success).toBe(true)
  })

  test('accepts Z timestamps and rejects invalid cursors', () => {
    expect(
      cursorSchema.safeParse({
        createdAt: '2026-10-21T09:48:42.512Z',
        id: '11111111-1111-4111-8111-111111111111',
      }).success
    ).toBe(true)
    expect(
      cursorSchema.safeParse({
        createdAt: 'yesterday',
        id: '11111111-1111-4111-8111-111111111111',
      }).success
    ).toBe(false)
  })
})
