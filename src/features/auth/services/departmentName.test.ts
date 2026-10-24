import { describe, expect, test } from 'vitest'
import { departmentName } from './departmentName'

describe('departmentName', () => {
  test('reads the single related department returned by PostgREST', () => {
    expect(departmentName({ name: 'Information Technology' })).toBe('Information Technology')
  })

  test('tolerates an array-shaped relation and missing data', () => {
    expect(departmentName([{ name: 'Computing' }])).toBe('Computing')
    expect(departmentName([])).toBeNull()
    expect(departmentName(null)).toBeNull()
  })
})
