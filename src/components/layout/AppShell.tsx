import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Bell, Menu } from 'lucide-react'
import logo from '@/assets/acd-logo.png'
import { signOut } from '@/features/auth/actions'
import type { AuthProfile } from '@/features/auth/types'
import { Button } from '@/components/common/button/Button'
import {
  countUnreadNotifications,
  listNotifications,
} from '@/features/notifications/repositories/notificationRepository'
import { cn } from '@/lib/cn'
import { Breadcrumbs } from './Breadcrumbs'
import { Container } from './Container'
import { Section } from './Section'
import { Navigation } from './Navigation'

export async function AppShell({
  children,
  profile,
}: {
  children: ReactNode
  profile: AuthProfile
}) {
  const role = profile.role!
  const [notifications, unread] = await Promise.all([
    listNotifications(5),
    countUnreadNotifications(),
  ])

  return (
    <div data-ui="app-shell" className="min-h-screen md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col bg-primary px-4 py-5 text-white md:flex">
        <Link
          className="mb-8 flex items-center gap-3 rounded-md px-2 text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
          href={`/${role.toLowerCase()}`}
        >
          <Image
            src={logo}
            alt=""
            width={40}
            height={40}
            unoptimized
            loading="eager"
            className="size-10 shrink-0 rounded-full object-contain"
          />
          <strong className="text-sm leading-tight">Assumption College of Davao</strong>
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
              <Button type="submit" variant="secondary" size="compact" className="w-full text-sm">
                Sign out
              </Button>
            </form>
          </div>
        </details>
      </aside>

      <div className="min-w-0">
        <header
          data-ui="topbar"
          className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-surface/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8"
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
              <div className="mt-3 border-t border-white/15 pt-3">
                <p className="truncate px-3 text-sm font-semibold">{profile.fullName}</p>
                <p className="truncate px-3 text-xs text-blue-100/70">{profile.email}</p>
                <form action={signOut} className="mt-3">
                  <Button
                    type="submit"
                    variant="secondary"
                    size="compact"
                    className="w-full text-sm"
                  >
                    Sign out
                  </Button>
                </form>
              </div>
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
                    className={cn('border-b border-border p-3', !item.read_at && 'bg-subtle')}
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
