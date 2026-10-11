import { describe, expect, test } from 'vitest'
import { getFacultyAvailability } from './facultyAvailability'
import type { SlotResult } from '../types'

const slot = (overrides: Partial<SlotResult> = {}): SlotResult => ({
  id: '11111111-1111-4111-8111-111111111111',
  slot_date: '2026-10-20',
  start_time: '09:00:00',
  end_time: '10:00:00',
  slot_status: 'OPEN',
  mode: 'IN_PERSON',
  location: 'Room 101',
  ...overrides,
})

describe('getFacultyAvailability', () => {
  test('rejects a non-uuid faculty id without touching the repository', async () => {
    let called = false
    await expect(
      getFacultyAvailability('not-a-uuid', {
        listSlots: async () => {
          called = true
          return []
        },
      })
    ).rejects.toThrow()
    expect(called).toBe(false)
  })

  test('returns the repository slots for a valid faculty id', async () => {
    const slots = [slot(), slot({ id: '22222222-2222-4222-8222-222222222222' })]
    const result = await getFacultyAvailability('33333333-3333-4333-8333-333333333333', {
      listSlots: async () => slots,
    })
    expect(result).toEqual(slots)
  })
})
