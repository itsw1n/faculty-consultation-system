'use client'

import type { ReactNode } from 'react'
import { Table, type TableProps } from 'react-aria-components'
import { cn } from '@/lib/cn'

type DataTableProps = Omit<TableProps, 'className' | 'children'> & {
  children: ReactNode
  className?: string
}

/** Shared responsive container for React Aria tables. */
export function DataTable({ children, className, ...props }: DataTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <Table
        {...props}
        className={cn(
          'min-w-[48rem] w-full table-fixed border-collapse text-left text-sm [&_th]:font-medium [&_td]:transition-colors [&_tr:hover_td]:bg-subtle/40',
          className
        )}
      >
        {children}
      </Table>
    </div>
  )
}
