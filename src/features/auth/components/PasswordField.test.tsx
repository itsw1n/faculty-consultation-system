import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { PasswordField } from './PasswordField'

afterEach(cleanup)

describe('PasswordField', () => {
  it('reveals and hides the password', () => {
    render(
      <PasswordField id="password" name="password" label="Password" autoComplete="new-password" />
    )

    const input = screen.getByLabelText('Password', { selector: 'input' })
    expect(input).toHaveAttribute('type', 'password')

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(input).toHaveAttribute('type', 'text')

    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(input).toHaveAttribute('type', 'password')
  })
})
