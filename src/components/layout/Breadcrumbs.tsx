'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const labels: Record<string, string> = {
  book: 'Book Consultation',
  consultations: 'My Consultations',
  availability: 'My Availability',
  requests: 'Consultation Requests',
  users: 'Manage Users',
  faculty: 'Manage Faculty',
  departments: 'Departments',
  notifications: 'Notifications',
}

export function Breadcrumbs() {
  const segments = usePathname().split('/').filter(Boolean).filter((segment) => !/^[-0-9a-f]{36}$/i.test(segment))
  if (segments.length <= 1) return <div className="mr-auto"><strong>Dashboard</strong><small className="block text-muted">CampusConnect</small></div>

  return <nav className="mr-auto flex items-center gap-2 text-sm" aria-label="Breadcrumb">{segments.slice(1).map((segment, index) => { const href = '/' + segments.slice(0, index + 2).join('/'); const label = labels[segment] ?? segment.replaceAll('-', ' '); return <span className="flex items-center gap-2" key={href}>{index > 0 && <i className="not-italic text-muted" aria-hidden="true">/</i>}{index === segments.length - 2 ? <strong>{label}</strong> : <Link className="text-muted hover:text-foreground" href={href}>{label}</Link>}</span> })}</nav>
}
