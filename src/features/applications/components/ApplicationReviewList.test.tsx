import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApplicationReviewList } from './ApplicationReviewList'
import type { ApplicationItem } from '../types'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

vi.mock('../actions', () => ({
  correctUserAccount: vi.fn(async () => ({ error: null })),
}))

vi.mock('../queries/getApplicationPage', () => ({
  getApplicationPage: vi.fn(async () => ({ items: [], hasMore: false, nextCursor: null })),
}))

afterEach(cleanup)

const item = (overrides: Partial<ApplicationItem> = {}): ApplicationItem => ({
  id: '11111111-1111-4111-8111-111111111111',
  full_name: 'Alex Reyes',
  email: 'alex@acdeducation.com',
  requested_role: null,
  account_status: 'APPROVED',
  department_name: 'IT',
  created_at: '2026-10-01T00:00:00Z',
  role: 'STUDENT',
  department_id: '22222222-2222-4222-8222-222222222222',
  position_title: null,
  ...overrides,
})

const departments = [{ id: '22222222-2222-4222-8222-222222222222', name: 'IT' }]

const filters = { search: '', role: '', department: '' }

describe('ApplicationReviewList directory', () => {
  it('shows every account with its role, without checkboxes', () => {
    render(
      <ApplicationReviewList
        initialPage={{
          items: [
            item(),
            item({
              id: '33333333-3333-4333-8333-333333333333',
              full_name: 'Maria Cruz',
              email: 'maria@acdeducation.com',
              role: 'FACULTY',
            }),
          ],
          hasMore: false,
          nextCursor: null,
        }}
        filters={filters}
        departments={departments}
      />
    )

    expect(screen.getByText('Alex Reyes')).toBeInTheDocument()
    expect(screen.getByRole('grid', { name: 'User accounts' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')).toHaveLength(5)
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Edit User' })).toHaveLength(2)
    expect(screen.getByRole('columnheader', { name: 'Position' })).toBeInTheDocument()
  })

  it('prefills the correction form with the account values and its id', () => {
    render(
      <ApplicationReviewList
        initialPage={{ items: [item()], hasMore: false, nextCursor: null }}
        filters={filters}
        departments={departments}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Edit User' }))
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).getByLabelText('Role')).toBeInTheDocument()
    expect(document.querySelector('input[name="userId"]')?.getAttribute('value')).toBe(
      '11111111-1111-4111-8111-111111111111'
    )
  })

  it('does not show a faculty invitation form', () => {
    render(
      <ApplicationReviewList
        initialPage={{ items: [], hasMore: false, nextCursor: null }}
        filters={filters}
        departments={departments}
      />
    )

    expect(screen.queryByRole('heading', { name: /invite faculty/i })).not.toBeInTheDocument()
  })
})
