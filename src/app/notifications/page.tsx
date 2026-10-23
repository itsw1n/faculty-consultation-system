import { redirect } from 'next/navigation'
import { PageHeading } from '@/components/common/PageHeading'
import { AppShell } from '@/components/layout/AppShell'
import { getAuthenticatedProfile } from '@/features/auth/repositories/authRepository'
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
      <NotificationList initialPage={page} unread={unread} />
    </AppShell>
  )
}
