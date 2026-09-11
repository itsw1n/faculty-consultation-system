import type { ReactNode } from 'react'
import { RoleLayout } from '@/components/layout/RoleLayout'
export default function StudentLayout({ children }: { children: ReactNode }) { return <RoleLayout role="STUDENT">{children}</RoleLayout> }
