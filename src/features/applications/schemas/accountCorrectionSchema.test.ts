import { describe, expect, test } from 'vitest'
import { accountCorrectionSchema } from './accountCorrectionSchema'

const valid = {
  userId: '11111111-1111-4111-8111-111111111111',
  role: 'FACULTY',
  departmentId: '22222222-2222-4222-8222-222222222222',
  positionTitle: 'Lecturer',
} as const

describe('accountCorrectionSchema', () => {
  test('accepts a faculty correction with a position title', () => {
    expect(accountCorrectionSchema.safeParse(valid).success).toBe(true)
  })

  test('accepts a student correction without a position title', () => {
    const student = { userId: valid.userId, departmentId: valid.departmentId, role: 'STUDENT' }
    expect(accountCorrectionSchema.safeParse(student).success).toBe(true)
  })

  test('never accepts the admin role', () => {
    expect(accountCorrectionSchema.safeParse({ ...valid, role: 'ADMIN' }).success).toBe(false)
  })

  test('accepts a faculty correction without a position title (server keeps the current one)', () => {
    const noPosition = { userId: valid.userId, departmentId: valid.departmentId, role: valid.role }
    expect(accountCorrectionSchema.safeParse(noPosition).success).toBe(true)
  })

  test('rejects a non-uuid user id', () => {
    expect(accountCorrectionSchema.safeParse({ ...valid, userId: 'nope' }).success).toBe(false)
  })
})
