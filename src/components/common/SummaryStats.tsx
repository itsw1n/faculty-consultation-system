import { cn } from '@/lib/cn'

type SummaryItem = {
  label: string
  value: number
  description?: string
}

export function SummaryStats({ items, className }: { items: SummaryItem[]; className?: string }) {
  return (
    <dl
      data-ui="summary-stats"
      className={cn(
        'grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-px overflow-hidden rounded-xl border border-border bg-border',
        className
      )}
    >
      {items.map((item) => (
        <div className="bg-surface px-5 py-4" key={item.label}>
          <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{item.label}</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-primary">{item.value}</dd>
          {item.description ? <p className="mt-1 text-sm text-muted">{item.description}</p> : null}
        </div>
      ))}
    </dl>
  )
}
