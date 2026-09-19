import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

afterEach(cleanup)

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal title="Add Availability" isOpen={false} onOpenChange={() => {}}>
        <p>Body content</p>
      </Modal>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the title, close control, and feature content when open', () => {
    render(
      <Modal title="Add Availability" isOpen onOpenChange={() => {}}>
        <p>Body content</p>
      </Modal>
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAccessibleName('Add Availability')
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(screen.getByText('Body content')).toBeInTheDocument()
  })

  it('keeps the header fixed and lets only the content area scroll', () => {
    render(
      <Modal title="Add Availability" isOpen onOpenChange={() => {}}>
        <p>Body content</p>
      </Modal>
    )

    const header = document.querySelector('header')
    expect(header).not.toBeNull()
    expect(header?.className).toMatch(/shrink-0/)
    expect(header?.className).not.toMatch(/overflow-y-auto/)

    const content = screen.getByText('Body content').parentElement
    expect(content?.className).toMatch(/overflow-y-auto/)
  })

  it('reports closing through onOpenChange when the X button is pressed', () => {
    const onOpenChange = vi.fn()
    render(
      <Modal title="Add Availability" isOpen onOpenChange={onOpenChange}>
        <p>Body content</p>
      </Modal>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
