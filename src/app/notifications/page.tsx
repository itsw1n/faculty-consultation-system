import { redirect } from 'next/navigation'
import { Button } from '@/components/common/button/Button'
import { PageHeading } from '@/components/common/PageHeading'
import { AppShell } from '@/components/layout/AppShell'
import { getAuthenticatedProfile } from '@/features/auth/repositories/authRepository'
import { markAllNotificationsRead } from '@/features/notifications/actions'
import {
  countUnreadNotifications,
  getNotificationPage,
} from '@/features/notifications/repositories/notificationRepository'
import { NotificationList } from '@/features/notifications/components/NotificationList'
export default async function NotificationsPage() {
  const profile = await getAuthenticatedProfile()
  if (!profile || profile.accountStatus !== 'APPROVED' || !profile.role) redirect('/auth/continue')
  const [page, unread] = await Promise.all([
    getNotificationPage(profile.id),
    countUnreadNotifications(profile.id),
  ])
  return (
    <AppShell profile={profile}>
      <PageHeading
        title="Notifications"
        description="Updates about applications and consultations."
      />
      {unread > 0 && (
        <form action={markAllNotificationsRead} className="mb-3 text-right">
          <Button variant="ghost" type="submit">
            Mark all as read
          </Button>
        </form>
      )}
      <NotificationList
        key={page.items.map((item) => `${item.id}:${item.read_at ?? 'unread'}`).join('|')}
        initialPage={page}
      />
    </AppShell>
  )
}
