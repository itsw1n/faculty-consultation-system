import type { ReactNode } from 'react'
import { RoleLayout } from '@/components/layout/RoleLayout'
export default function FacultyLayout({ children }: { children: ReactNode }) {
  return <RoleLayout role="FACULTY">{children}</RoleLayout>
}
