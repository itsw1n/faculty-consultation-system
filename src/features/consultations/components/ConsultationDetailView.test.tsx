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
