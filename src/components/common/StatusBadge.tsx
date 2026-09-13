import { cn } from '@/lib/cn'

const statusColors: Record<string, string> = {
  OPEN: 'bg-emerald-50 text-success',
  APPROVED: 'bg-emerald-50 text-success',
  COMPLETED: 'bg-blue-50 text-blue-800',
  RESERVED: 'bg-amber-50 text-warning',
  PENDING: 'bg-amber-50 text-warning',
  BOOKED: 'bg-blue-50 text-blue-800',
  CLOSED: 'bg-slate-100 text-muted',
  CANCELLED: 'bg-slate-100 text-muted',
  REJECTED: 'bg-red-50 text-danger',
}

export function StatusBadge({ status }: { status: string | null }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold',
        statusColors[status ?? ''] ?? 'bg-subtle text-primary'
      )}
    >
      {status ?? 'Unknown'}
    </span>
  )
}
