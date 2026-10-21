'use client'

import { Cell, Column, Row, TableBody, TableHeader } from 'react-aria-components'
import { Button } from '@/components/common/button/Button'
import { DataTable } from '@/components/common/table/DataTable'
import { updateDepartment } from '../actions'

type Department = { id: string; code: string; name: string }

export function DepartmentTable({ departments }: { departments: Department[] }) {
  return (
    <>
      {departments.map((department) => (
        <form action={updateDepartment} id={`department-${department.id}`} key={department.id}>
          <input type="hidden" name="id" value={department.id} />
        </form>
      ))}
      <DataTable aria-label="Existing departments">
        <TableHeader className="border-b border-border bg-background text-xs font-semibold tracking-wide text-muted uppercase">
          <Column isRowHeader className="w-[22%] px-5 py-3">
            Code
          </Column>
          <Column className="w-[58%] px-5 py-3">Name</Column>
          <Column className="w-[20%] px-5 py-3 text-right">Action</Column>
        </TableHeader>
        <TableBody items={departments} renderEmptyState={() => 'No departments yet.'}>
          {(department) => {
            const formId = `department-${department.id}`
            return (
              <Row className="border-b border-border last:border-0 data-[focus-visible-within]:outline-3 data-[focus-visible-within]:outline-focus">
                <Cell className="px-5 py-4">
                  <input
                    className="min-h-11 w-full rounded-md border border-border px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus"
                    form={formId}
                    name="code"
                    aria-label={`Code for ${department.name}`}
                    defaultValue={department.code}
                    required
                    minLength={2}
                    maxLength={20}
                  />
                </Cell>
                <Cell className="px-5 py-4">
                  <input
                    className="min-h-11 w-full rounded-md border border-border px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus"
                    form={formId}
                    name="name"
                    aria-label={`Name for ${department.name}`}
                    defaultValue={department.name}
                    required
                    minLength={2}
                    maxLength={120}
                  />
                </Cell>
                <Cell className="px-5 py-4 text-right">
                  <Button form={formId} type="submit" variant="secondary">
                    Save changes
                  </Button>
                </Cell>
              </Row>
            )
          }}
        </TableBody>
      </DataTable>
    </>
  )
}
