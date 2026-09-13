import { describe, expect, test } from 'vitest'
import { getAuthDestination } from './getAuthDestination'
import type { AuthProfile } from '@/features/auth/types'

const profile = (overrides: Partial<AuthProfile> = {}): AuthProfile => ({
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
    [profile(), '/apply'],
    [profile({ accountStatus: 'PENDING', requestedRole: 'STUDENT' }), '/application/pending'],
    [profile({ accountStatus: 'REJECTED', requestedRole: 'FACULTY' }), '/application/rejected'],
    [profile({ accountStatus: 'APPROVED', role: 'STUDENT' }), '/student'],
    [profile({ accountStatus: 'APPROVED', role: 'FACULTY' }), '/faculty'],
    [profile({ accountStatus: 'APPROVED', role: 'ADMIN' }), '/admin'],
  ])('routes profile state to its allowed destination', (value, destination) => {
    expect(getAuthDestination(value)).toBe(destination)
  })
})
