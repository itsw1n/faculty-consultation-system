'use client'

import { Cell, Column, Row, TableBody, TableHeader } from 'react-aria-components'
import { useState } from 'react'
import { DepartmentActionForm } from './DepartmentActionForm'
import { DataTable } from '@/components/common/table/DataTable'
import { updateDepartment } from '../actions'

type Department = { id: string; code: string; name: string }

export function DepartmentTable({ departments }: { departments: Department[] }) {
  const [values, setValues] = useState<Record<string, { code: string; name: string }>>({})
  function change(department: Department, field: 'code' | 'name', value: string) {
    setValues((current) => ({
      ...current,
      [department.id]: {
        ...(current[department.id] ?? { code: department.code, name: department.name }),
        [field]: value,
      },
    }))
  }
  return (
    <div data-admin-list="departments">
      <DataTable aria-label="Existing departments">
        <TableHeader className="border-b border-border bg-background text-xs font-semibold tracking-wide text-muted uppercase">
          <Column isRowHeader className="w-[22%] px-5 py-3">
            Code
          </Column>
          <Column className="w-[58%] px-5 py-3">Name</Column>
          <Column className="w-[20%] px-5 py-3 text-right">Action</Column>
        </TableHeader>
        <TableBody
          dependencies={[values]}
          items={departments}
          renderEmptyState={() => 'No departments yet.'}
        >
          {(department) => {
            const formId = `department-${department.id}`
            return (
              <Row className="border-b border-border last:border-0 data-[focus-visible-within]:outline-3 data-[focus-visible-within]:outline-focus">
                <Cell data-label="Code" className="px-5 py-4">
                  <input
                    className="min-h-11 w-full rounded-md border border-border px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus"
                    form={formId}
                    name="code"
                    aria-label={`Code for ${department.name}`}
                    value={values[department.id]?.code ?? department.code}
                    onChange={(event) => change(department, 'code', event.target.value)}
                    required
                    minLength={2}
                    maxLength={20}
                  />
                </Cell>
                <Cell data-label="Name" className="px-5 py-4">
                  <input
                    className="min-h-11 w-full rounded-md border border-border px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus"
                    form={formId}
                    name="name"
                    aria-label={`Name for ${department.name}`}
                    value={values[department.id]?.name ?? department.name}
                    onChange={(event) => change(department, 'name', event.target.value)}
                    required
                    minLength={2}
                    maxLength={120}
                  />
                </Cell>
                <Cell data-label="Actions" className="px-5 py-4 text-right">
                  <DepartmentActionForm
                    action={updateDepartment}
                    id={formId}
                    departmentId={department.id}
                    label="Save changes"
                    successMessage="Changes saved."
                  />
                </Cell>
              </Row>
            )
          }}
        </TableBody>
      </DataTable>
    </div>
  )
}
