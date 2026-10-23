import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import type { ConsultationItem } from '../types'
import { ConsultationDetailsDialog } from './ConsultationDetailsDialog'

vi.mock('../actions', () => ({
  completeConsultationWithFeedback: vi.fn(),
}))

afterEach(cleanup)

const baseItem: ConsultationItem = {
  id: 'consultation-1',
  student_name: 'Erwin Curato',
  faculty_name: 'Made Win',
  category: 'Academic concern',
  notes: 'Discuss practicum requirements.',
  consultation_status: 'APPROVED',
  slot_date: '2026-10-28',
  start_time: '13:00:00',
  end_time: '14:00:00',
  mode: 'ONLINE',
  location: null,
  created_at: '2026-10-20T00:00:00Z',
  outcome: null,
  student_department: 'Information Technology',
  faculty_department: 'Information Technology',
}

function renderDialog(item: ConsultationItem, viewer: 'STUDENT' | 'FACULTY') {
  render(<ConsultationDetailsDialog item={item} viewer={viewer} />)
  fireEvent.click(
    screen.getByRole('button', {
      name: `View consultation details with ${viewer === 'STUDENT' ? item.faculty_name : item.student_name}`,
    })
  )
}

describe('ConsultationDetailsDialog', () => {
  test('offers completion only to faculty on approved consultations', () => {
    renderDialog(baseItem, 'FACULTY')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Outcome Note')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Mark as Completed' }))
    const confirmation = screen.getByRole('alertdialog')
    expect(within(confirmation).getByText('Mark consultation as completed?')).toBeInTheDocument()
  })

  test('keeps approved consultations read-only for students', () => {
    renderDialog(baseItem, 'STUDENT')
    expect(screen.queryByLabelText('Outcome Note')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mark as Completed' })).not.toBeInTheDocument()
  })

  test('shows the saved outcome for completed consultations without completion controls', () => {
    renderDialog(
      {
        ...baseItem,
        consultation_status: 'COMPLETED',
        outcome: 'Discussed practicum requirements and provided guidance.',
      },
      'FACULTY'
    )
    expect(
      screen.getByText('Discussed practicum requirements and provided guidance.')
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('Outcome Note')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mark as Completed' })).not.toBeInTheDocument()
  })

  test('keeps pending consultations read-only', () => {
    renderDialog({ ...baseItem, consultation_status: 'PENDING' }, 'FACULTY')
    expect(screen.queryByLabelText('Outcome Note')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mark as Completed' })).not.toBeInTheDocument()
  })
})
