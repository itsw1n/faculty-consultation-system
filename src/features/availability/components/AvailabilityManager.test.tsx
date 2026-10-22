import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AvailabilityManager } from './AvailabilityManager'
import type { AvailabilityItem } from '../repositories/availabilityRepository'

vi.mock('../actions', () => ({
  createAvailability: vi.fn(),
  updateAvailability: vi.fn(),
  deleteAvailability: vi.fn(),
}))

afterEach(cleanup)

const slot = (overrides: Partial<AvailabilityItem> = {}): AvailabilityItem => ({
  id: '11111111-1111-4111-8111-111111111111',
  date: '2026-10-20',
  start_time: '09:00:00',
  end_time: '10:00:00',
  status: 'OPEN',
  mode: 'IN_PERSON',
  location: 'Room 101',
  meeting_link: null,
  student_name: null,
  category: null,
  ...overrides,
})

describe('AvailabilityManager edit', () => {
  it('offers edit only for open slots', () => {
    render(
      <AvailabilityManager
        slots={[slot(), slot({ id: '22222222-2222-4222-8222-222222222222', status: 'BOOKED' })]}
      />
    )

    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(1)
  })

  it('offers a view action for booked and reserved slots', () => {
    render(
      <AvailabilityManager
        slots={[
          slot({ id: '22222222-2222-4222-8222-222222222222', status: 'BOOKED' }),
          slot({ id: '33333333-3333-4333-8333-333333333333', status: 'RESERVED' }),
        ]}
      />
    )

    expect(screen.getAllByRole('button', { name: 'View' })).toHaveLength(2)
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  })

  it('prefills the edit form with the slot values and its id', () => {
    render(<AvailabilityManager slots={[slot()]} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

    expect(screen.getByRole('heading', { name: 'Edit availability' })).toBeInTheDocument()
    expect(screen.getByLabelText('Date')).toHaveValue('2026-10-20')
    expect(screen.getByLabelText('Start')).toHaveValue('09:00')
    expect(screen.getByLabelText('Location')).toHaveValue('Room 101')
    expect(document.querySelector('input[name="slotId"]')?.getAttribute('value')).toBe(
      '11111111-1111-4111-8111-111111111111'
    )
  })
})
