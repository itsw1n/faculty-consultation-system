import { describe, expect, test } from 'vitest'
import { getAuthDestination } from './getAuthDestination'
import type { AuthProfile } from '@/features/auth/types'

const profile = (overrides: Partial<AuthProfile> = {}): AuthProfile => ({
  id: '11111111-1111-4111-8111-111111111111',
  accountStatus: null,
  email: 'user@school.edu',
  fullName: 'User',
  departmentName: null,
  positionTitle: null,
  requestedRole: null,
  role: null,
  ...overrides,
})

describe('getAuthDestination', () => {
  test.each([
    [profile(), '/'],
    [profile({ accountStatus: 'PENDING' }), '/application/pending'],
    [profile({ accountStatus: 'REJECTED' }), '/application/rejected'],
    [profile({ accountStatus: 'APPROVED', role: 'STUDENT' }), '/student'],
    [profile({ accountStatus: 'APPROVED', role: 'FACULTY' }), '/faculty'],
    [profile({ accountStatus: 'APPROVED', role: 'ADMIN' }), '/admin'],
  ])('routes profile state to its allowed destination', (value, destination) => {
    expect(getAuthDestination(value)).toBe(destination)
  })
})
