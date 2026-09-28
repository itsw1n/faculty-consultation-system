import type { ReactNode } from 'react'

export function PageHeading({
  title,
  description,
  eyebrow = 'CampusConnect workspace',
  action,
}: {
  title: string
  description: string
  eyebrow?: string
  action?: ReactNode
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="mb-2 text-xs font-bold tracking-[0.14em] text-accent uppercase">{eyebrow}</p>
        <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">{title}</h1>
        <p className="mt-2 text-muted">{description}</p>
      </div>
      {action}
    </header>
  )
}
