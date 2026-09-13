import Link from 'next/link'
import type { ReactNode } from 'react'
import { Bell, CalendarDays, ClipboardList, GraduationCap, Home, Menu, Users } from 'lucide-react'
import { signOut } from '@/features/auth/actions'
import type { AuthProfile, UserRole } from '@/features/auth/types'
import { listNotifications } from '@/features/notifications/repositories/notificationRepository'
import { cn } from '@/lib/cn'
import { Breadcrumbs } from './Breadcrumbs'
import { Container } from './Container'
import { Section } from './Section'

const links: Record<UserRole, { href: string; label: string; icon: typeof Home }[]> = {
  STUDENT: [
    { href: '/student', label: 'Dashboard', icon: Home },
    { href: '/student/book', label: 'Book Consultation', icon: CalendarDays },
    { href: '/student/consultations', label: 'My Consultations', icon: ClipboardList },
  ],
  FACULTY: [
    { href: '/faculty', label: 'Dashboard', icon: Home },
    { href: '/faculty/availability', label: 'My Availability', icon: CalendarDays },
    { href: '/faculty/requests', label: 'Consultation Requests', icon: ClipboardList },
    { href: '/faculty/consultations', label: 'My Consultations', icon: GraduationCap },
  ],
  ADMIN: [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/users', label: 'Manage Users', icon: Users },
    { href: '/admin/faculty', label: 'Manage Faculty', icon: GraduationCap },
    { href: '/admin/departments', label: 'Departments', icon: ClipboardList },
    { href: '/admin/consultations', label: 'Consultation Records', icon: CalendarDays },
  ],
}

function Navigation({ role, mobile = false }: { role: UserRole; mobile?: boolean }) {
  return (
    <nav aria-label={mobile ? 'Mobile navigation' : 'Primary navigation'} className="grid gap-1">
      {links[role].map(({ href, label, icon: Icon }) => (
        <Link
          href={href}
          key={href}
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-white transition-colors hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <Icon aria-hidden="true" size={18} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  )
}

export async function AppShell({
  children,
  profile,
}: {
  children: ReactNode
  profile: AuthProfile
}) {
  const role = profile.role!
  const notifications = await listNotifications(5)
  const unread = notifications.filter((item) => !item.read_at).length

  return (
    <div data-ui="app-shell" className="min-h-screen md:grid md:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col bg-primary p-5 text-white md:flex">
        <Link
          className="mb-8 flex items-center gap-3 rounded-lg text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
          href={`/${role.toLowerCase()}`}
        >
          <span className="grid size-10 place-items-center rounded-lg border border-white font-extrabold">
            CC
          </span>
          <strong>CampusConnect</strong>
        </Link>
        <Navigation role={role} />
        <details className="group relative mt-auto">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 rounded-lg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus">
            <span className="grid size-10 place-items-center rounded-full bg-white font-extrabold text-primary">
              {profile.fullName.slice(0, 1).toUpperCase()}
            </span>
            <span className="grid min-w-0">
              <strong className="truncate">{profile.fullName}</strong>
              <small className="capitalize opacity-70">{role.toLowerCase()}</small>
            </span>
          </summary>
          <div className="absolute bottom-14 left-0 w-full rounded-lg bg-white/10 p-3 backdrop-blur-sm">
            <dl className="mb-3">
              <dt className="text-xs uppercase opacity-70">Email</dt>
              <dd className="mb-2 text-sm [overflow-wrap:anywhere]">{profile.email}</dd>
              <dt className="text-xs uppercase opacity-70">Role</dt>
              <dd className="mb-2 text-sm capitalize">{role.toLowerCase()}</dd>
              <dt className="text-xs uppercase opacity-70">Department</dt>
              <dd className="mb-2 text-sm">{profile.departmentName ?? 'Not assigned'}</dd>
              {profile.positionTitle && (
                <>
                  <dt className="text-xs uppercase opacity-70">Position</dt>
                  <dd className="mb-2 text-sm">{profile.positionTitle}</dd>
                </>
              )}
            </dl>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex min-h-9 w-full items-center justify-center rounded-lg bg-surface px-3 py-1.5 text-sm font-bold text-primary hover:bg-subtle focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                Sign out
              </button>
            </form>
          </div>
        </details>
      </aside>

      <div className="min-w-0">
        <header
          data-ui="topbar"
          className="flex h-18 items-center gap-4 border-b border-border bg-surface px-4 sm:px-6 lg:px-10"
        >
          <details className="relative md:hidden">
            <summary
              aria-label="Open navigation"
              className="grid min-h-11 cursor-pointer list-none place-items-center rounded-lg focus-visible:outline-3 focus-visible:outline-focus"
            >
              <Menu aria-hidden="true" />
            </summary>
            <div className="absolute top-12 left-0 z-20 w-64 rounded-xl bg-primary p-3 text-white shadow-card">
              <Navigation role={role} mobile />
            </div>
          </details>
          <Breadcrumbs />
          <details className="relative ml-auto">
            <summary
              aria-label={`${unread} unread notifications`}
              className="relative grid min-h-11 cursor-pointer list-none place-items-center rounded-lg px-2 focus-visible:outline-3 focus-visible:outline-focus"
            >
              <Bell aria-hidden="true" />
              {unread > 0 && (
                <span className="absolute top-0 right-0 min-w-5 rounded-full bg-danger px-1 text-center text-xs text-white">
                  {unread}
                </span>
              )}
            </summary>
            <div className="absolute top-12 right-0 z-20 w-[min(22rem,80vw)] overflow-hidden rounded-xl border border-border bg-surface shadow-card">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-muted">No notifications yet.</p>
              ) : (
                notifications.map((item) => (
                  <article
                    key={item.id}
                    className={cn('border-b border-border p-3', !item.read_at && 'bg-blue-50')}
                  >
                    <strong>{item.title}</strong>
                    <p className="mt-1 text-sm text-muted">{item.message}</p>
                  </article>
                ))
              )}
              <Link
                className="block p-3 text-center font-bold text-primary hover:bg-subtle"
                href="/notifications"
              >
                View all notifications
              </Link>
            </div>
          </details>
        </header>
        <main>
          <Section>
            <Container>{children}</Container>
          </Section>
        </main>
      </div>
    </div>
  )
}
