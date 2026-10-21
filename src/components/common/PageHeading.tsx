import type { ReactNode } from 'react'

export function PageHeading({
  title,
  description,
  eyebrow,
  action,
}: {
  title: string
  description: string
  eyebrow?: string
  action?: ReactNode
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold tracking-[0.12em] text-accent uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">{title}</h1>
        <p className="mt-2 leading-relaxed text-muted">{description}</p>
      </div>
      {action}
    </header>
  )
}
