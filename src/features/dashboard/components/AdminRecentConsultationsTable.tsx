'use client'

import { Cell, Column, Row, TableBody, TableHeader } from 'react-aria-components'
import { DataTable } from '@/components/common/table/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { ConsultationItem } from '@/features/consultations/types'

export function AdminRecentConsultationsTable({ items }: { items: ConsultationItem[] }) {
  return (
    <div data-admin-list="recent">
      <DataTable aria-label="Recent consultations" className="min-w-[40rem]">
        <TableHeader className="border-b border-border bg-background text-xs font-semibold tracking-wide text-muted uppercase">
          <Column isRowHeader className="w-[28%] px-5 py-3">
            Student
          </Column>
          <Column className="w-[28%] px-5 py-3">Faculty</Column>
          <Column className="w-[26%] px-5 py-3">Schedule</Column>
          <Column className="w-[18%] px-5 py-3">Status</Column>
        </TableHeader>
        <TableBody items={items} renderEmptyState={() => 'No consultation activity yet.'}>
          {(item) => (
            <Row className="border-b border-border last:border-0">
              <Cell className="px-5 py-4">
                <strong className="font-semibold text-primary">{item.student_name}</strong>
              </Cell>
              <Cell data-label="Faculty" className="px-5 py-4 text-sm text-muted">
                {item.faculty_name}
              </Cell>
              <Cell data-label="Schedule" className="px-5 py-4 text-sm text-muted">
                {item.slot_date} · {item.start_time.slice(0, 5)}–{item.end_time.slice(0, 5)}
              </Cell>
              <Cell data-label="Status" className="px-5 py-4">
                <StatusBadge status={item.consultation_status} />
              </Cell>
            </Row>
          )}
        </TableBody>
      </DataTable>
    </div>
  )
}
