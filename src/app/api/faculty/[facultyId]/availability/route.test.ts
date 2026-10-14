import { beforeEach, describe, expect, test, vi } from 'vitest'
import { GET } from './route'
import { getAuthenticatedProfile } from '@/features/auth/repositories/authRepository'
import { getFacultyAvailability } from '@/features/booking/services/facultyAvailability'
import type { AuthProfile } from '@/features/auth/types'
import type { SlotResult } from '@/features/booking/types'

vi.mock('@/features/auth/repositories/authRepository', () => ({
  getAuthenticatedProfile: vi.fn(),
}))

vi.mock('@/features/booking/services/facultyAvailability', async (importOriginal) => {
  const mod =
    await importOriginal<typeof import('@/features/booking/services/facultyAvailability')>()
  return { ...mod, getFacultyAvailability: vi.fn() }
})

const profile = (overrides: Partial<AuthProfile> = {}): AuthProfile => ({
  accountStatus: 'APPROVED',
  email: 'student@school.edu',
  fullName: 'Student',
  departmentName: null,
  positionTitle: null,
  requestedRole: null,
  role: 'STUDENT',
  ...overrides,
})

const VALID_ID = '33333333-3333-4333-8333-333333333333'
const request = () => new Request(`http://localhost/api/faculty/${VALID_ID}/availability`)
const params = (facultyId: string) => ({ params: Promise.resolve({ facultyId }) })

beforeEach(() => {
  vi.resetAllMocks()
})

describe('GET /api/faculty/[facultyId]/availability', () => {
  test('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedProfile).mockResolvedValue(null)
    const response = await GET(request(), params(VALID_ID))
    expect(response.status).toBe(401)
    expect(vi.mocked(getFacultyAvailability)).not.toHaveBeenCalled()
  })

  test('returns 403 when approved but not a student', async () => {
    vi.mocked(getAuthenticatedProfile).mockResolvedValue(profile({ role: 'FACULTY' }))
    const response = await GET(request(), params(VALID_ID))
    expect(response.status).toBe(403)
    expect(vi.mocked(getFacultyAvailability)).not.toHaveBeenCalled()
  })

  test('returns 403 when account is not approved', async () => {
    vi.mocked(getAuthenticatedProfile).mockResolvedValue(
      profile({ accountStatus: 'PENDING', role: null })
    )
    const response = await GET(request(), params(VALID_ID))
    expect(response.status).toBe(403)
    expect(vi.mocked(getFacultyAvailability)).not.toHaveBeenCalled()
  })

  test('returns 400 for a non-uuid faculty id', async () => {
    vi.mocked(getAuthenticatedProfile).mockResolvedValue(profile())
    const response = await GET(request(), params('not-a-uuid'))
    expect(response.status).toBe(400)
    expect(vi.mocked(getFacultyAvailability)).not.toHaveBeenCalled()
  })

  test('returns slots for an approved student with a valid id', async () => {
    vi.mocked(getAuthenticatedProfile).mockResolvedValue(profile())
    const slots: SlotResult[] = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        slot_date: '2026-10-20',
        start_time: '09:00:00',
        end_time: '10:00:00',
        slot_status: 'OPEN',
        mode: 'IN_PERSON',
        location: 'Room 101',
      },
    ]
    vi.mocked(getFacultyAvailability).mockResolvedValue(slots)
    const response = await GET(request(), params(VALID_ID))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ slots })
    expect(vi.mocked(getFacultyAvailability)).toHaveBeenCalledWith(VALID_ID)
  })

  test('returns 500 without leaking internals when the service fails', async () => {
    vi.mocked(getAuthenticatedProfile).mockResolvedValue(profile())
    vi.mocked(getFacultyAvailability).mockRejectedValue(new Error('select * from secret_table'))
    const response = await GET(request(), params(VALID_ID))
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(JSON.stringify(body)).not.toContain('secret_table')
  })
})
