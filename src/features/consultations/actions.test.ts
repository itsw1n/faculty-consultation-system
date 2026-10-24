import { beforeEach, expect, test, vi } from 'vitest'

const { rpc, deliverEmails } = vi.hoisted(() => ({
  rpc: vi.fn(),
  deliverEmails: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/features/auth/repositories/authRepository', () => ({ requireRole: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ rpc })),
}))
vi.mock('@/features/email/services/deliverEmails', () => ({ deliverEmails }))

import { cancelConsultation, decideConsultation } from './actions'

function consultationForm(fields: Record<string, string>) {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) formData.set(key, value)
  return formData
}

beforeEach(() => {
  vi.clearAllMocks()
  rpc.mockResolvedValue({ error: null })
  deliverEmails.mockResolvedValue({ claimed: 1, sent: 1 })
})

test.each(['true', 'false'])(
  'processes queued email immediately after a successful faculty decision (%s)',
  async (approve) => {
    await decideConsultation(
      consultationForm({ consultationId: '123e4567-e89b-42d3-a456-426614174000', approve })
    )

    expect(rpc).toHaveBeenCalledWith('decide_consultation', {
      target_consultation_id: '123e4567-e89b-42d3-a456-426614174000',
      approve: approve === 'true',
    })
    expect(deliverEmails).toHaveBeenCalledOnce()
  }
)

test('processes queued email immediately after a successful student cancellation', async () => {
  await cancelConsultation(
    consultationForm({ consultationId: '123e4567-e89b-42d3-a456-426614174000' })
  )

  expect(rpc).toHaveBeenCalledWith('cancel_consultation', {
    target_consultation_id: '123e4567-e89b-42d3-a456-426614174000',
  })
  expect(deliverEmails).toHaveBeenCalledOnce()
})

test('does not process email when the database status change fails', async () => {
  rpc.mockResolvedValue({ error: new Error('database failure') })

  await expect(
    decideConsultation(
      consultationForm({
        consultationId: '123e4567-e89b-42d3-a456-426614174000',
        approve: 'true',
      })
    )
  ).rejects.toThrow('The request state changed. Refresh and try again.')

  expect(deliverEmails).not.toHaveBeenCalled()
})
