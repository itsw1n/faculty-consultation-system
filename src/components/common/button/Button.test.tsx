import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('applies the selected visual variant and disabled behavior', () => {
    render(
      <Button variant="danger" isDisabled>
        Remove
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Remove' })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('bg-danger')
  })
})
