import { describe, expect, test } from 'vitest'
import type { AuthProfile } from '@/features/auth/types'
import { evaluateRoleAccess } from './roleAccess'

const profile = (overrides: Partial<AuthProfile> = {}): AuthProfile => ({
  id: '11111111-1111-4111-8111-111111111111',
  accountStatus: 'APPROVED',
  email: 'user@school.edu',
  fullName: 'User',
  departmentName: null,
  positionTitle: null,
  role: 'STUDENT',
  ...overrides,
})

describe('evaluateRoleAccess', () => {
  test('rejects requests without an authenticated user', () => {
    expect(evaluateRoleAccess({ userId: null, profile: null }, 'ADMIN')).toEqual({
      ok: false,
      status: 401,
    })
  })

  test('rejects an authenticated user whose profile is missing', () => {
    expect(evaluateRoleAccess({ userId: profile().id, profile: null }, 'ADMIN')).toEqual({
      ok: false,
      status: 403,
    })
  })

  test('rejects a non-approved profile', () => {
    const pending = profile({ accountStatus: 'PENDING', role: null })
    expect(evaluateRoleAccess({ userId: pending.id, profile: pending }, 'ADMIN')).toEqual({
      ok: false,
      status: 403,
    })
  })

  test('rejects an approved student from an admin resource', () => {
    const student = profile()
    expect(evaluateRoleAccess({ userId: student.id, profile: student }, 'ADMIN')).toEqual({
      ok: false,
      status: 403,
    })
  })

  test('rejects an approved faculty member from an admin resource', () => {
    const faculty = profile({ role: 'FACULTY' })
    expect(evaluateRoleAccess({ userId: faculty.id, profile: faculty }, 'ADMIN')).toEqual({
      ok: false,
      status: 403,
    })
  })

  test('accepts an approved admin for an admin resource', () => {
    const admin = profile({ role: 'ADMIN' })
    expect(evaluateRoleAccess({ userId: admin.id, profile: admin }, 'ADMIN')).toEqual({
      ok: true,
      profile: admin,
    })
  })
})
