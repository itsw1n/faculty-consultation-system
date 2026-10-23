import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { NotificationList } from './NotificationList'

const markAllNotificationsRead = vi.fn().mockResolvedValue(undefined)

vi.mock('../actions', () => ({
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: () => markAllNotificationsRead(),
}))

vi.mock('../queries/getNotificationPage', () => ({
  getNotificationPage: vi.fn(),
}))

afterEach(() => {
  cleanup()
  markAllNotificationsRead.mockClear()
})

const item = {
  id: 'notification-1',
  type: 'CONSULTATION_APPROVED',
  title: 'Consultation approved',
  message: 'Your request was approved.',
  read_at: null,
  created_at: '2026-10-23T00:00:00Z',
}

describe('NotificationList', () => {
  test('marks every already-loaded notification read after marking all', async () => {
    render(
      <NotificationList
        initialPage={{ items: [item], hasMore: false, nextCursor: null }}
        unread={1}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Mark all as read' }))

    await waitFor(() => expect(markAllNotificationsRead).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.queryByText('Mark read')).not.toBeInTheDocument())
  })
})
