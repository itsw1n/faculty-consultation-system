import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { createDepartment } from '../actions'
import { CreateDepartmentForm } from './CreateDepartmentForm'

vi.mock('../actions', () => ({ createDepartment: vi.fn() }))
vi.mock('next/navigation', () => ({ unstable_rethrow: vi.fn() }))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function fillForm() {
  fireEvent.change(screen.getByLabelText('Code'), { target: { value: 'IT' } })
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Information Technology' } })
}

test('keeps failed department input and presents safe local feedback', async () => {
  vi.mocked(createDepartment).mockRejectedValueOnce(new Error('secret_database_details'))
  render(<CreateDepartmentForm />)
  fillForm()
  fireEvent.click(screen.getByRole('button', { name: 'Add department' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('use a unique code and name')
  expect(screen.queryByText('secret_database_details')).not.toBeInTheDocument()
  expect(screen.getByLabelText('Code')).toHaveValue('IT')
  expect(screen.getByLabelText('Name')).toHaveValue('Information Technology')
})

test('disables submission while saving and clears fields after success', async () => {
  let finish!: () => void
  vi.mocked(createDepartment).mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve
      })
  )
  render(<CreateDepartmentForm />)
  fillForm()
  fireEvent.click(screen.getByRole('button', { name: 'Add department' }))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled())
  finish()
  expect(await screen.findByRole('status')).toHaveTextContent('Department added.')
  expect(screen.getByLabelText('Code')).toHaveValue('')
  expect(screen.getByLabelText('Name')).toHaveValue('')
  expect(screen.getByRole('button', { name: 'Add department' })).toBeEnabled()
})
