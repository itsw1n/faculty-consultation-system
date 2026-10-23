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
    <section className="mt-5 border-y border-border py-10 text-center">
      <h2 className="text-lg font-semibold text-primary">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">{description}</p>
      {action}
    </section>
  )
}
