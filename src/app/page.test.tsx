import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomePage from './page'

test('renders the email and password sign-in entry point', () => {
  render(<HomePage />)
  expect(
    screen.getByRole('heading', { name: 'Welcome to Assumption College of Davao' })
  ).toBeInTheDocument()
  expect(screen.getByLabelText('School email')).toBeInTheDocument()
  expect(screen.getByLabelText('Password')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Sign in/ })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Create account' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Forgot password?' })).not.toBeInTheDocument()
})
