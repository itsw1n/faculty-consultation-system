'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'
import type { UserRole } from '@/features/auth/types'

const labels: Record<string, string> = {
  book: 'Book Consultation',
  consultations: 'My Consultations',
  availability: 'My Availability',
  requests: 'Consultation Requests',
  users: 'Manage Users',
  departments: 'Departments',
  notifications: 'Notifications',
}
export function Breadcrumbs({ role }: { role: UserRole }) {
  const segments = usePathname().split('/').filter(Boolean)
  const root = `/${role.toLowerCase()}`
  const current = segments.at(-1) ?? ''
  const isDetail = /^[-0-9a-f]{36}$/i.test(current)
  const label = isDetail
    ? segments.includes('book')
      ? 'Choose schedule'
      : 'Consultation details'
    : current === 'consultations' && role === 'ADMIN'
      ? 'Consultation Records'
      : (labels[current] ?? 'Dashboard')
  return (
    <nav aria-label="Breadcrumb" className="mr-auto flex min-w-0 items-center gap-2 text-sm">
      <Link
        href={root}
        className="hidden shrink-0 text-muted hover:text-primary focus-visible:outline-3 focus-visible:outline-focus sm:inline"
      >
        {role.charAt(0) + role.slice(1).toLowerCase()} portal
      </Link>
      <ChevronRight
        size={14}
        aria-hidden="true"
        className="hidden shrink-0 text-muted/60 sm:block"
      />
      <span aria-current="page" className="truncate font-medium text-foreground">
        {label}
      </span>
    </nav>
  )
}
