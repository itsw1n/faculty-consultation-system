import { describe, expect, it } from 'vitest'
import { selectRecentConsultations } from './dashboardUtils'

const items = [
  { id: 'p1', consultation_status: 'PENDING' },
  { id: 'p2', consultation_status: 'PENDING' },
  { id: 'p3', consultation_status: 'PENDING' },
  { id: 'p4', consultation_status: 'PENDING' },
  { id: 'a1', consultation_status: 'APPROVED' },
  { id: 'a2', consultation_status: 'APPROVED' },
  { id: 'a3', consultation_status: 'APPROVED' },
  { id: 'a4', consultation_status: 'APPROVED' },
]

describe('selectRecentConsultations', () => {
  it('removes every pending row and excluded id, then caps the result', () => {
    expect(selectRecentConsultations(items, new Set(['a2']), 3).map((item) => item.id)).toEqual([
      'a1',
      'a3',
      'a4',
    ])
    expect(selectRecentConsultations(items, new Set(), 3).map((item) => item.id)).toEqual([
      'a1',
      'a2',
      'a3',
    ])
  })

  it('does not mutate the source array', () => {
    const source = [...items]
    const result = selectRecentConsultations(source, new Set(['a1']), 3)
    expect(source.map((item) => item.id)).toEqual(['p1', 'p2', 'p3', 'p4', 'a1', 'a2', 'a3', 'a4'])
    expect(result.map((item) => item.id)).toEqual(['a2', 'a3', 'a4'])
  })

  it('returns an empty array for empty input', () => {
    expect(selectRecentConsultations([], new Set(), 3)).toEqual([])
  })
})
