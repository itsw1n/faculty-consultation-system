import Link from 'next/link'
import type { ReactNode } from 'react'
import { Bell, CalendarDays, ClipboardList, GraduationCap, Home, Menu, Users } from 'lucide-react'
import { signOut } from '@/features/auth/actions'
import type { AuthProfile, UserRole } from '@/features/auth/types'

const links: Record<UserRole, { href: string; label: string; icon: typeof Home }[]> = {
  STUDENT: [
    { href: '/student', label: 'Dashboard', icon: Home }, { href: '/student/book', label: 'Book Consultation', icon: CalendarDays }, { href: '/student/consultations', label: 'My Consultations', icon: ClipboardList },
  ],
  FACULTY: [
    { href: '/faculty', label: 'Dashboard', icon: Home }, { href: '/faculty/availability', label: 'My Availability', icon: CalendarDays }, { href: '/faculty/requests', label: 'Consultation Requests', icon: ClipboardList }, { href: '/faculty/consultations', label: 'My Consultations', icon: GraduationCap },
  ],
  ADMIN: [
    { href: '/admin', label: 'Dashboard', icon: Home }, { href: '/admin/users', label: 'Manage Users', icon: Users }, { href: '/admin/faculty', label: 'Manage Faculty', icon: GraduationCap }, { href: '/admin/departments', label: 'Departments', icon: ClipboardList }, { href: '/admin/consultations', label: 'Consultation Records', icon: CalendarDays },
  ],
}

function Navigation({ role }: { role: UserRole }) {
  return <nav aria-label="Primary navigation">{links[role].map(({ href, label, icon: Icon }) => <Link href={href} key={href}><Icon aria-hidden="true" size={18}/><span>{label}</span></Link>)}</nav>
}

export function AppShell({ children, profile }: { children: ReactNode; profile: AuthProfile }) {
  const role = profile.role!
  return <div className="app-shell">
    <aside className="sidebar"><Link className="sidebar-brand" href={`/${role.toLowerCase()}`}><span>CC</span><strong>CampusConnect</strong></Link><Navigation role={role}/><details className="profile-menu"><summary><span className="avatar">{profile.fullName.slice(0, 1).toUpperCase()}</span><span><strong>{profile.fullName}</strong><small>{role.toLowerCase()}</small></span></summary><div><p>{profile.email}</p><form action={signOut}><button type="submit">Sign out</button></form></div></details></aside>
    <div className="app-column"><header className="app-header"><details className="mobile-menu"><summary aria-label="Open navigation"><Menu aria-hidden="true"/></summary><div><Navigation role={role}/></div></details><div><strong>CampusConnect</strong><small>Faculty Consultation &amp; Scheduling System</small></div><Link aria-label="Notifications" href="/notifications"><Bell aria-hidden="true"/></Link></header><main className="app-content">{children}</main></div>
  </div>
}
