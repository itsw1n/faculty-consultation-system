import type { ReactNode } from 'react'
import { requireRole } from '@/features/auth/repositories/authRepository'
import type { UserRole } from '@/features/auth/types'
import { AppShell } from './AppShell'

export async function RoleLayout({ children, role }: { children: ReactNode; role: UserRole }) {
  return await AppShell({ profile: await requireRole(role), children })
}
