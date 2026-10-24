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
    <header className="mb-7 flex flex-wrap items-center justify-between gap-5">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold tracking-[0.12em] text-muted uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      </div>
      {action}
    </header>
  )
}
