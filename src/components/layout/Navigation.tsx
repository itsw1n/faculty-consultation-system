'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { UserRole } from '@/features/auth/types'
import { cn } from '@/lib/cn'
import {
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Home,
  Users,
  type LucideIcon,
} from 'lucide-react'

type NavigationItem = { href: string; label: string; icon: LucideIcon }

export function Navigation({ role, mobile = false }: { role: UserRole; mobile?: boolean }) {
  const pathname = usePathname()
  const items: Record<UserRole, NavigationItem[]> = {
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
      { href: '/admin/departments', label: 'Departments', icon: ClipboardList },
      { href: '/admin/consultations', label: 'Consultation Records', icon: CalendarDays },
    ],
  }

  return (
    <nav aria-label={mobile ? 'Mobile navigation' : 'Primary navigation'} className="grid gap-1">
      <p className="px-3 pb-2 text-[0.65rem] font-bold tracking-[0.16em] text-blue-100/60 uppercase">
        {role.toLowerCase()} portal
      </p>
      {items[role].map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href ||
          (href !== `/${role.toLowerCase()}` && pathname.startsWith(`${href}/`))
        return (
          <Link
            href={href}
            key={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus',
              active
                ? 'bg-white text-primary shadow-xs'
                : 'text-blue-100/85 hover:bg-white/10 hover:text-white'
            )}
          >
            <Icon aria-hidden="true" size={18} strokeWidth={active ? 2.3 : 1.8} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
