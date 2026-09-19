import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Select } from './Select'

afterEach(cleanup)

const options = [
  { id: 'all', label: 'All departments' },
  { id: 'education', label: 'Education' },
  { id: 'it', label: 'IT' },
]

describe('Select', () => {
  it('shows the placeholder when nothing is selected', () => {
    render(<Select label="Department" options={options} placeholder="Select a department" />)

    expect(screen.getByRole('button')).toHaveTextContent('Select a department')
  })

  it('shows the selected option label in the trigger', () => {
    render(<Select label="Department" options={options} defaultValue="it" />)

    expect(screen.getByRole('button')).toHaveTextContent('IT')
  })

  it('opens the listbox with every option and marks the selected one', () => {
    render(<Select label="Department" options={options} defaultValue="it" />)

    const trigger = screen.getByRole('button')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)

    const listbox = screen.getByRole('listbox')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const items = within(listbox).getAllByRole('option')
    expect(items.map((item) => item.textContent)).toEqual(['All departments', 'Education', 'IT'])

    const selected = within(listbox).getByRole('option', { selected: true })
    expect(selected).toHaveTextContent('IT')
    expect(selected.querySelector('svg')).not.toBeNull()
  })

  it('reports the chosen option id through onChange', () => {
    const onChange = vi.fn()
    render(<Select label="Department" options={options} defaultValue="it" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('option', { name: 'Education' }))

    expect(onChange).toHaveBeenCalledWith('education')
  })

  it('keeps the reset option available after another option is selected', () => {
    render(<Select label="Department" options={options} value="it" onChange={() => {}} />)

    fireEvent.click(screen.getByRole('button'))

    expect(screen.getByRole('option', { name: 'All departments' })).toBeInTheDocument()
  })
})
