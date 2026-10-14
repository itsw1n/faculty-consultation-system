import { describe, expect, test } from 'vitest'
import { applicationSchema } from './applicationSchema'

const valid = {
  requestedRole: 'STUDENT',
  departmentId: '11111111-1111-4111-8111-111111111111',
} as const

describe('applicationSchema', () => {
  test('accepts a student application', () => {
    expect(applicationSchema.safeParse(valid).success).toBe(true)
  })

  test('accepts a faculty application with a position title', () => {
    expect(
      applicationSchema.safeParse({ ...valid, requestedRole: 'FACULTY', positionTitle: 'Lecturer' })
        .success
    ).toBe(true)
  })

  test('rejects a faculty application without a position title', () => {
    expect(applicationSchema.safeParse({ ...valid, requestedRole: 'FACULTY' }).success).toBe(false)
  })

  test('never accepts the admin role', () => {
    expect(applicationSchema.safeParse({ ...valid, requestedRole: 'ADMIN' }).success).toBe(false)
  })
})
