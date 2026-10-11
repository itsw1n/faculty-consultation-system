import Link from 'next/link'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeading } from '@/components/common/PageHeading'
import { getAdminDashboard } from '@/features/dashboard/repositories/dashboardRepository'
import { ClipboardCheck, GraduationCap, History } from 'lucide-react'
const card = 'rounded-xl border border-border bg-surface p-5 shadow-card'
export default async function AdminDashboard() {
  const data = await getAdminDashboard()
  return (
    <>
      <PageHeading
        eyebrow="Administration workspace"
        title="Admin Dashboard"
        description="Review applications and oversee consultation activity."
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-4">
        <section className={card}>
          <div className="flex items-center justify-between text-accent">
            <span className="text-sm font-semibold">Pending applications</span>
            <ClipboardCheck size={19} aria-hidden="true" />
          </div>
          <strong className="mt-4 block text-3xl text-primary">{data.pending}</strong>
          <p className="mt-1 text-sm text-muted">Users awaiting review</p>
        </section>
        <section className={card}>
          <div className="flex items-center justify-between text-accent">
            <span className="text-sm font-semibold">Active faculty</span>
            <GraduationCap size={19} aria-hidden="true" />
          </div>
          <strong className="mt-4 block text-3xl text-primary">{data.faculty}</strong>
          <p className="mt-1 text-sm text-muted">Approved faculty accounts</p>
        </section>
        <section className={card}>
          <div className="flex items-center justify-between text-accent">
            <span className="text-sm font-semibold">Consultations</span>
            <History size={19} aria-hidden="true" />
          </div>
          <strong className="mt-4 block text-3xl text-primary">{data.consultations}</strong>
          <p className="mt-1 text-sm text-muted">All consultation records</p>
        </section>
      </div>
      {data.pending === 0 && (
        <EmptyState
          title="No pending applications"
          description="New student and faculty applications will appear here."
          action={
            <Link
              className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 font-bold text-white"
              href="/admin/users"
            >
              Manage Users
            </Link>
          }
        />
      )}
    </>
  )
}
