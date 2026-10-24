import { describe, expect, it } from 'vitest'
import {
  facultyConsultationsCsv,
  type FacultyConsultationExportRow,
} from './facultyConsultationsCsv'

const row: FacultyConsultationExportRow = {
  consultation_id: 'consultation-1',
  student_name: '=HYPERLINK("https://bad.test")',
  category: 'ACADEMIC',
  consultation_status: 'COMPLETED',
  slot_date: '2026-10-24',
  start_time: '09:00:00',
  end_time: '10:00:00',
  mode: 'IN_PERSON',
  location: 'Room "A", Building 1',
  created_at: '2026-10-20T10:00:00.000Z',
}

describe('facultyConsultationsCsv', () => {
  it('exports status and schedule metadata while escaping formulas and quoting cells', () => {
    const csv = facultyConsultationsCsv([row])

    expect(csv).toContain('"Status","Date","Start time","End time"')
    expect(csv).toContain(`"'=HYPERLINK(""https://bad.test"")"`)
    expect(csv).toContain('"Room ""A"", Building 1"')
    expect(csv.endsWith('\r\n')).toBe(true)
  })

  it('writes headers and no data rows for an empty range', () => {
    const csv = facultyConsultationsCsv([])

    expect(csv.split('\r\n')).toHaveLength(2)
    expect(csv).toContain('"Consultation ID","Student","Category","Status"')
  })
})
