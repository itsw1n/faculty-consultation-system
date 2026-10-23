import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { AlertDialog } from './AlertDialog'

describe('AlertDialog', () => {
  test('uses the contextual accessible label for the trigger', () => {
    render(
      <AlertDialog
        label="Approve"
        accessibleLabel="Approve consultation with Maria Santos"
        title="Approve consultation?"
        description="This confirms the selected schedule."
        fields={{ consultationId: 'consultation-1', approve: 'true' }}
        submitAction={async () => {}}
      />
    )
    expect(
      screen.getByRole('button', { name: 'Approve consultation with Maria Santos' })
    ).toBeInTheDocument()
  })
})
