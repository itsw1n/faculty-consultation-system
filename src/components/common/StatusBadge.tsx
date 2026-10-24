import { cn } from '@/lib/cn'

const statusColors: Record<string, string> = {
  OPEN: 'bg-success/8 text-success',
  APPROVED: 'bg-success/8 text-success',
  COMPLETED: 'bg-accent/8 text-accent-hover',
  RESERVED: 'bg-warning/8 text-warning',
  PENDING: 'bg-warning/8 text-warning',
  BOOKED: 'bg-accent/8 text-accent-hover',
  CLOSED: 'bg-muted/8 text-muted',
  CANCELLED: 'bg-muted/8 text-muted',
  REJECTED: 'bg-danger/8 text-danger',
}

const statusLabels: Record<string, string> = {
  STUDENT: 'Student',
  FACULTY: 'Faculty',
  ADMIN: 'Admin',
  OPEN: 'Open',
  APPROVED: 'Approved',
  COMPLETED: 'Completed',
  RESERVED: 'Reserved',
  PENDING: 'Pending',
  BOOKED: 'Booked',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
}

export function StatusBadge({ status }: { status: string | null }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs leading-4 font-medium ring-1 ring-inset ring-current/10',
        statusColors[status ?? ''] ?? 'bg-subtle text-primary'
      )}
    >
      {statusLabels[status ?? ''] ?? status ?? 'Unknown'}
    </span>
  )
}
