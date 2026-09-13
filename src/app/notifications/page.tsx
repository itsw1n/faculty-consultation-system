import { redirect } from 'next/navigation'
import { PageHeading } from '@/components/common/PageHeading'
import { AppShell } from '@/components/layout/AppShell'
import { getAuthenticatedProfile } from '@/features/auth/repositories/authRepository'
import { markAllNotificationsRead } from '@/features/notifications/actions'
import { getNotificationPage } from '@/features/notifications/repositories/notificationRepository'
import { NotificationList } from '@/features/notifications/components/NotificationList'
export default async function NotificationsPage(){const profile=await getAuthenticatedProfile();if(!profile||profile.accountStatus!=='APPROVED'||!profile.role)redirect('/auth/continue');const page=await getNotificationPage();return <AppShell profile={profile}><PageHeading title="Notifications" description="Updates about applications and consultations."/>{page.items.some(item=>!item.read_at)&&<form action={markAllNotificationsRead} className="mb-3 text-right"><button className="min-h-11 rounded-lg px-3 font-bold text-primary hover:bg-subtle">Mark all as read</button></form>}<NotificationList initialPage={page}/></AppShell>}
