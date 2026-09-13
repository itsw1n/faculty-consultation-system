import type { ReactNode } from 'react'
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <section className="mt-4 rounded-xl border border-border bg-surface px-4 py-12 text-center shadow-card">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2 text-muted">{description}</p>
      {action}
    </section>
  )
}
