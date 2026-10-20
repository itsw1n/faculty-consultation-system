import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ClaimAdminForm } from './ClaimAdminForm'

vi.mock('../actions', () => ({
  claimFirstAdmin: vi.fn(async () => ({ error: 'Admin claim is not available for this account.' })),
  signOut: vi.fn(),
}))

afterEach(cleanup)

describe('ClaimAdminForm', () => {
  it('offers the first-admin claim', () => {
    render(<ClaimAdminForm />)

    expect(screen.getByRole('button', { name: /claim administrator access/i })).toBeInTheDocument()
  })

  it('shows the safe error when the claim is rejected', async () => {
    render(<ClaimAdminForm />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /claim administrator access/i }))
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Admin claim is not available for this account.'
    )
  })
})
