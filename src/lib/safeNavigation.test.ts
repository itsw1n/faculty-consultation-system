import { describe, expect, test } from 'vitest'
import { safeHttpUrl, safeNextPath } from './safeNavigation'

describe('safeNextPath', () => {
  test('keeps internal paths', () => {
    expect(safeNextPath('/student/consultations?tab=upcoming')).toBe(
      '/student/consultations?tab=upcoming'
    )
  })

  test('rejects external and protocol-relative paths', () => {
    expect(safeNextPath('https://evil.example')).toBe('/auth/continue')
    expect(safeNextPath('//evil.example')).toBe('/auth/continue')
    expect(safeNextPath('/\\evil.example')).toBe('/auth/continue')
    expect(safeNextPath('/%5Cevil.example')).toBe('/auth/continue')
    expect(safeNextPath('/%2F%2Fevil.example')).toBe('/auth/continue')
  })

  test('uses the fallback for empty or malformed input', () => {
    expect(safeNextPath(null)).toBe('/auth/continue')
    expect(safeNextPath('/%')).toBe('/auth/continue')
    expect(safeNextPath(null, '/faculty')).toBe('/faculty')
  })
})

describe('safeHttpUrl', () => {
  test('accepts http and https links', () => {
    expect(safeHttpUrl('https://meet.example.com/room/1')).toBe('https://meet.example.com/room/1')
  })

  test('rejects other protocols and malformed values', () => {
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull()
    expect(safeHttpUrl('not a link')).toBeNull()
    expect(safeHttpUrl(null)).toBeNull()
  })
})
