import { describe, expect, test } from 'vitest'
import { departmentSchema, departmentUpdateSchema } from './departmentSchema'

describe('departmentSchema', () => {
  test('accepts a valid code and name', () => {
    expect(departmentSchema.safeParse({ code: 'it', name: 'IT' }).success).toBe(true)
  })

  test('uppercases the code', () => {
    expect(departmentSchema.parse({ code: 'it', name: 'IT' })).toMatchObject({ code: 'IT' })
  })

  test('rejects a one-character code', () => {
    expect(departmentSchema.safeParse({ code: 'x', name: 'IT' }).success).toBe(false)
  })

  test('update schema requires an id', () => {
    expect(departmentUpdateSchema.safeParse({ code: 'IT', name: 'IT' }).success).toBe(false)
    expect(
      departmentUpdateSchema.safeParse({
        id: '11111111-1111-4111-8111-111111111111',
        code: 'IT',
        name: 'IT',
      }).success
    ).toBe(true)
  })
})
