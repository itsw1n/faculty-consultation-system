import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { DepartmentTable } from './DepartmentTable'
import { updateDepartment } from '../actions'
vi.mock('../actions', () => ({ updateDepartment: vi.fn(async () => {}) }))
vi.mock('next/navigation', () => ({ unstable_rethrow: vi.fn() }))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

test('submits edited external row fields with the correct department id', async () => {
  render(
    <DepartmentTable
      departments={[{ id: '11111111-1111-4111-8111-111111111111', code: 'IT', name: 'Computing' }]}
    />
  )
  fireEvent.change(screen.getByLabelText('Name for Computing'), {
    target: { value: 'Information Technology' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
  await waitFor(() => expect(updateDepartment).toHaveBeenCalledOnce())
  const submitted = vi.mocked(updateDepartment).mock.calls[0]![0]
  expect(submitted.get('name')).toBe('Information Technology')
  expect(submitted.get('code')).toBe('IT')
  expect(submitted.get('id')).toBe('11111111-1111-4111-8111-111111111111')
  expect(await screen.findByRole('status')).toHaveTextContent('Changes saved.')
})
