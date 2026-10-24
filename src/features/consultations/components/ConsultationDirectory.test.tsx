import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { ConsultationDirectory } from './ConsultationDirectory'
import type { ConsultationItem } from '../types'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
vi.mock('../actions', () => ({ cancelConsultation: vi.fn(), decideConsultation: vi.fn() }))
vi.mock('../queries/getConsultationPage', () => ({ getConsultationPage: vi.fn() }))
vi.mock('./ConsultationDetailsDialog', () => ({
  ConsultationDetailsDialog: () => <button>View details</button>,
}))
afterEach(cleanup)
const consultation: ConsultationItem = {
  id: 'consultation-1',
  student_name: 'Alex Reyes',
  faculty_name: 'Maria Santos',
  category: 'ACADEMIC',
  notes: 'Private consultation notes',
  outcome: 'Private outcome',
  consultation_status: 'APPROVED',
  slot_date: '2026-10-25',
  start_time: '09:00:00',
  end_time: '10:00:00',
  mode: 'ONLINE',
  location: null,
  meeting_link: 'https://meet.example.com/private',
  created_at: '2026-10-20T00:00:00Z',
  student_department: 'IT',
  faculty_department: 'Education',
}

test('admin records show both participants without private details or action controls', () => {
  render(
    <ConsultationDirectory
      viewer="ADMIN"
      initialPage={{ items: [consultation], hasMore: false, nextCursor: null }}
    />
  )
  expect(screen.getByRole('columnheader', { name: 'Faculty' })).toBeInTheDocument()
  expect(screen.getByText('Alex Reyes')).toBeInTheDocument()
  expect(screen.getByText('Maria Santos')).toBeInTheDocument()
  expect(screen.getAllByRole('columnheader')).toHaveLength(5)
  expect(screen.queryByRole('columnheader', { name: 'Action' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'View details' })).not.toBeInTheDocument()
  expect(screen.queryByText('Private consultation notes')).not.toBeInTheDocument()
  expect(screen.queryByText('Private outcome')).not.toBeInTheDocument()
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
})

test('student records retain their existing detail action', () => {
  render(
    <ConsultationDirectory
      viewer="STUDENT"
      initialPage={{ items: [consultation], hasMore: false, nextCursor: null }}
    />
  )
  expect(screen.getByRole('button', { name: 'View details' })).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: 'Action' })).toBeInTheDocument()
})
