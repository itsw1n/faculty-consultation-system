import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomePage from './page'

test('renders the Google authentication entry point', () => {
  render(<HomePage />)
  expect(screen.getByRole('heading', { name: 'Welcome to CampusConnect' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument()
})
