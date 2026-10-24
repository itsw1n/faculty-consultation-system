import { describe, expect, it } from 'vitest'
import { consultationIcs } from './consultationIcs'

const event = {
  id: '6f1c2a3e-0000-4000-8000-000000000001',
  title: 'Consultation with Dr. Reyes',
  purpose: 'Academic advising',
  slot_date: '2026-10-01',
  start_time: '07:30:00',
  end_time: '08:00:00',
  location: 'Room 204, Main Building',
}

describe('consultationIcs', () => {
  it('converts Manila slot times to UTC and includes only shareable fields', () => {
    const result = consultationIcs(event, new Date('2026-09-30T12:00:00.000Z'))
    expect(result).toBe(
      [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Assumption College of Davao//Faculty Consultation//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:6f1c2a3e-0000-4000-8000-000000000001@faculty-consultation-system',
        'DTSTAMP:20260930T120000Z',
        'DTSTART:20260930T233000Z',
        'DTEND:20261001T000000Z',
        'SUMMARY:Consultation with Dr. Reyes',
        'DESCRIPTION:Purpose: Academic advising',
        'LOCATION:Room 204\\, Main Building',
        'END:VEVENT',
        'END:VCALENDAR',
        '',
      ].join('\r\n')
    )
  })

  it('escapes line breaks and folds long lines', () => {
    const result = consultationIcs({ ...event, location: `Line one\n${'x'.repeat(100)}` })
    expect(result).toContain('LOCATION:Line one\\n')
    for (const line of result.split('\r\n')) expect(line.length).toBeLessThanOrEqual(75)
  })
})
