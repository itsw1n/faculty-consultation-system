import { describe, expect, test } from 'vitest'
import { inviteFacultySchema } from './inviteFacultySchema'

const departmentId = '22222222-2222-4222-8222-222222222222'

describe('inviteFacultySchema', () => {
  test('accepts up to fifty emails with department and position', () => {
    expect(
      inviteFacultySchema.safeParse({
        emails: 'a@acdeducation.com, b@acdeducation.com',
        departmentId,
        positionTitle: 'Lecturer',
      }).success
    ).toBe(true)
  })

  test('rejects an empty email list', () => {
    expect(
      inviteFacultySchema.safeParse({ emails: '  , ', departmentId, positionTitle: 'Lecturer' })
        .success
    ).toBe(false)
  })

  test('rejects more than fifty emails', () => {
    const emails = Array(51).fill('x@acdeducation.com').join(',')
    expect(
      inviteFacultySchema.safeParse({ emails, departmentId, positionTitle: 'Lecturer' }).success
    ).toBe(false)
  })

  test('rejects a missing position title', () => {
    expect(
      inviteFacultySchema.safeParse({ emails: 'a@acdeducation.com', departmentId }).success
    ).toBe(false)
  })
})
