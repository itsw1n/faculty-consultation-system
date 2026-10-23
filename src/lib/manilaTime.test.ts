import { describe, expect, test } from 'vitest'
import { addDays, isPastSlot, manilaDateKey, manilaTimeKey } from './manilaTime'

const justAfterMidnight = new Date('2026-10-22T16:30:00Z')

describe('manilaTime', () => {
  test('formats the Manila calendar date and time', () => {
    expect(manilaDateKey(justAfterMidnight)).toBe('2026-10-23')
    expect(manilaTimeKey(justAfterMidnight)).toBe('00:30:00')
  })

  test('adds days across month and year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-10-23', -1)).toBe('2026-10-22')
  })

  test('treats earlier dates and ended same-day slots as past', () => {
    expect(isPastSlot('2026-10-22', '23:59:00', justAfterMidnight)).toBe(true)
    expect(isPastSlot('2026-10-23', '00:29', justAfterMidnight)).toBe(true)
    expect(isPastSlot('2026-10-23', '00:31', justAfterMidnight)).toBe(false)
    expect(isPastSlot('2026-10-24', '00:00', justAfterMidnight)).toBe(false)
  })
})
