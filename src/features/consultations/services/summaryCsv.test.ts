import { describe, expect, it } from 'vitest'
import { summaryCsv } from './summaryCsv'

describe('summaryCsv', () => {
  it('exports only summary fields and quotes spreadsheet formulas', () => {
    const result = summaryCsv([
      {
        slot_date: '2026-09-29',
        department: '=HYPERLINK("x")',
        category: 'PERSONAL',
        status: 'COMPLETED',
        total: 2,
      },
    ])
    expect(result).toBe(
      'Date,Department,Category,Status,Count\r\n"2026-09-29","\'=HYPERLINK(""x"")","PERSONAL","COMPLETED","2"\r\n'
    )
    expect(result).not.toContain('outcome')
  })
})
