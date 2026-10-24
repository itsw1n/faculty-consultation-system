import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import type { ConsultationDetail } from '../repositories/consultationDetailRepository'
import { ConsultationDetailView } from './ConsultationDetailView'

vi.mock('../actions', () => ({ completeConsultation: vi.fn() }))

afterEach(cleanup)

const detail: ConsultationDetail = {
  id: 'consultation-1',
  student_name: 'Erwin Curato',
  faculty_name: 'Made Win',
  category: 'ACADEMIC',
  description: 'Discuss practicum requirements.',
  outcome: null,
  consultation_status: 'APPROVED',
  slot_date: '2026-10-28',
  start_time: '13:00:00',
  end_time: '14:00:00',
  mode: 'ONLINE',
  location: null,
  meeting_link: 'https://meet.example.com/room/1',
}

describe('ConsultationDetailView', () => {
  test('links approved online consultations to their meeting room', () => {
    render(<ConsultationDetailView detail={detail} viewer="STUDENT" />)

    expect(screen.getByRole('link', { name: 'Join online consultation' })).toHaveAttribute(
      'href',
      'https://meet.example.com/room/1'
    )
  })

  test('does not expose meeting links before approval', () => {
    render(
      <ConsultationDetailView
        detail={{ ...detail, consultation_status: 'PENDING' }}
        viewer="STUDENT"
      />
    )

    expect(screen.queryByRole('link', { name: 'Join online consultation' })).not.toBeInTheDocument()
  })
})

test('faculty details keep one page landmark and provide an outcome submission for approved records', () => {
  render(<ConsultationDetailView detail={detail} viewer="FACULTY" />)
  expect(document.querySelector('main')).toBeNull()
  expect(screen.getByLabelText('Outcome note (optional)')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Mark completed' })).toBeInTheDocument()
})
test('completed faculty details show the outcome without completion controls', () => {
  render(
    <ConsultationDetailView
      detail={{ ...detail, consultation_status: 'COMPLETED', outcome: 'Reviewed the study plan.' }}
      viewer="FACULTY"
    />
  )
  expect(screen.getByText('Reviewed the study plan.')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Mark completed' })).not.toBeInTheDocument()
})

test('student details preserve the workspace landmark and remain read-only', () => {
  render(<ConsultationDetailView detail={detail} viewer="STUDENT" />)
  expect(document.querySelector('main')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Mark completed' })).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Back to consultations' })).toHaveAttribute(
    'href',
    '/student/consultations'
  )
})
