import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApplicationReviewList } from './ApplicationReviewList'
import type { ApplicationItem } from '../repositories/applicationRepository'

vi.mock('../actions', () => ({
  reviewApplication: vi.fn(),
  reviewApplications: vi.fn(),
  correctUserAccount: vi.fn(async () => ({ error: null })),
}))

vi.mock('../loadApplicationPage', () => ({
  loadApplicationPage: vi.fn(async () => ({ items: [], hasMore: false, nextCursor: null })),
}))

afterEach(cleanup)

const item = (overrides: Partial<ApplicationItem> = {}): ApplicationItem => ({
  id: '11111111-1111-4111-8111-111111111111',
  full_name: 'Alex Reyes',
  email: 'alex@student.acd.edu.ph',
  requested_role: 'STUDENT',
  account_status: 'APPROVED',
  department_name: 'IT',
  created_at: '2026-10-01T00:00:00Z',
  role: 'STUDENT',
  department_id: '22222222-2222-4222-8222-222222222222',
  ...overrides,
})

const departments = [{ id: '22222222-2222-4222-8222-222222222222', name: 'IT' }]

const filters = { search: '', status: 'APPROVED', role: '', department: '' }

describe('ApplicationReviewList correction', () => {
  it('offers correction only for approved accounts', () => {
    render(
      <ApplicationReviewList
        initialPage={{
          items: [
            item(),
            item({ id: '33333333-3333-4333-8333-333333333333', account_status: 'PENDING' }),
          ],
          hasMore: false,
          nextCursor: null,
        }}
        filters={filters}
        departments={departments}
      />
    )

    expect(screen.getAllByRole('button', { name: 'Correct' })).toHaveLength(1)
  })

  it('prefills the correction form with the account values and its id', () => {
    render(
      <ApplicationReviewList
        initialPage={{ items: [item()], hasMore: false, nextCursor: null }}
        filters={filters}
        departments={departments}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Correct' }))
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).getByLabelText('Role')).toBeInTheDocument()
    expect(document.querySelector('input[name="userId"]')?.getAttribute('value')).toBe(
      '11111111-1111-4111-8111-111111111111'
    )
  })
})
