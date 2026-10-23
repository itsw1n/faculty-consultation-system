import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BookingWizard } from './BookingWizard'
import type { SlotResult } from '../types'

vi.mock('../actions', () => ({ bookConsultation: vi.fn() }))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const FACULTY_ID = '33333333-3333-4333-8333-333333333333'

function futureKey(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`
}

const slot = (overrides: Partial<SlotResult> = {}): SlotResult => ({
  id: '11111111-1111-4111-8111-111111111111',
  slot_date: futureKey(),
  start_time: '09:00:00',
  end_time: '10:00:00',
  slot_status: 'OPEN',
  mode: 'IN_PERSON',
  location: 'Room 101',
  faculty_name: 'Dr. Ada Lovelace',
  ...overrides,
})

function mockFetchOnce(slots: SlotResult[], ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: async () => ({ slots }),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('BookingWizard details', () => {
  it('shows the shared category selector after choosing a slot', () => {
    render(<BookingWizard facultyId={FACULTY_ID} initialSlots={[slot()]} />)

    fireEvent.click(screen.getByRole('button', { name: /09:00/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByText('Select a concern')).toBeInTheDocument()
  })
})

describe('BookingWizard refresh', () => {
  it('requests fresh availability for the displayed faculty member', async () => {
    const fetchMock = mockFetchOnce([slot()])
    render(<BookingWizard facultyId={FACULTY_ID} initialSlots={[slot()]} />)

    fireEvent.click(screen.getByRole('button', { name: /refresh schedules/i }))

    expect(fetchMock).toHaveBeenCalledWith(`/api/faculty/${FACULTY_ID}/availability`)
    expect(await screen.findByRole('button', { name: /refresh schedules/i })).toBeInTheDocument()
  })

  it('replaces the shown slots with the fresh response', async () => {
    mockFetchOnce([slot({ start_time: '14:00:00', end_time: '15:00:00' })])
    render(<BookingWizard facultyId={FACULTY_ID} initialSlots={[slot()]} />)
    expect(screen.getByText('09:00–10:00')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /refresh schedules/i }))

    expect(await screen.findByText('14:00–15:00')).toBeInTheDocument()
    expect(screen.queryByText('09:00–10:00')).not.toBeInTheDocument()
  })

  it('keeps old slots and shows a safe message when refresh fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'select * from secret_table' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<BookingWizard facultyId={FACULTY_ID} initialSlots={[slot()]} />)

    fireEvent.click(screen.getByRole('button', { name: /refresh schedules/i }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.queryByText(/secret_table/)).not.toBeInTheDocument()
    expect(screen.getByText('09:00–10:00')).toBeInTheDocument()
  })
})

describe('BookingWizard review', () => {
  it('shows the selected schedule and keeps details when returning', () => {
    render(<BookingWizard facultyId={FACULTY_ID} initialSlots={[slot()]} />)

    fireEvent.click(screen.getByRole('button', { name: /09:00/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByText('Dr. Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('Room 101')).toBeInTheDocument()
    expect(screen.getByText('09:00–10:00')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Select a concern'))
    fireEvent.click(screen.getByRole('option', { name: 'Academic concern' }))
    fireEvent.change(screen.getByLabelText(/short description/i), {
      target: { value: 'Discuss my thesis proposal.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Review request' }))

    expect(screen.getByText('Academic concern')).toBeInTheDocument()
    expect(screen.getByText('Discuss my thesis proposal.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getAllByText('Academic concern').length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/short description/i)).toHaveValue('Discuss my thesis proposal.')
  })
})
describe('BookingWizard month navigation', () => {
  it('loads availability for the month selected in the calendar', async () => {
    const fetchMock = mockFetchOnce([slot()])
    render(<BookingWizard facultyId={FACULTY_ID} initialSlots={[slot()]} />)

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }))

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`/api/faculty/${FACULTY_ID}/availability\\?start=`))
      )
    )
  })
})
