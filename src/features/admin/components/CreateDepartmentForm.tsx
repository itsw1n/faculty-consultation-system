'use client'

import { useState } from 'react'
import { createDepartment } from '../actions'
import { DepartmentActionForm } from './DepartmentActionForm'

export function CreateDepartmentForm() {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  return (
    <DepartmentActionForm
      label="Add department"
      successMessage="Department added."
      className="mt-4 grid items-start gap-4 xl:[&>div]:pt-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]"
      action={async (data) => {
        await createDepartment(data)
        setCode('')
        setName('')
      }}
    >
      <label className="grid gap-1.5 text-xs font-semibold">
        Code
        <input
          name="code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          required
          minLength={2}
          maxLength={20}
          placeholder="e.g. IT"
          className="min-h-11 min-w-0 rounded-lg border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus"
        />
      </label>
      <label className="grid gap-1.5 text-xs font-semibold">
        Name
        <input
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          minLength={2}
          maxLength={120}
          placeholder="Full department name"
          className="min-h-11 min-w-0 rounded-lg border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus"
        />
      </label>
    </DepartmentActionForm>
  )
}
