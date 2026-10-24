'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/common/button/Button'
import { Modal } from '@/components/common/modal/Modal'
import { Select } from '@/components/common/select/Select'
import { SubmitButton } from '@/components/common/SubmitButton'
import { initialActionState } from '@/lib/actionState'
import { promoteFaculty } from '../actions'

type Department = { id: string; name: string }

function AddFacultyForm({
  departments,
  onSuccess,
}: {
  departments: Department[]
  onSuccess: (message: string) => void
}) {
  const [state, action] = useActionState(promoteFaculty, initialActionState)

  useEffect(() => {
    if (state.message) onSuccess(state.message)
  }, [state.message, onSuccess])

  return (
    <form action={action} className="mt-5 grid gap-4">
      <p className="text-sm text-muted">
        This person must already have a verified student account. Their existing login will be
        promoted to faculty.
      </p>
      <label className="grid gap-1.5 text-xs font-semibold">
        School email
        <input
          className="min-h-11 rounded-md border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus"
          name="email"
          type="email"
          autoComplete="off"
          required
          placeholder="name@acdeducation.com"
        />
      </label>
      <Select
        label="Department"
        name="departmentId"
        options={departments.map((department) => ({ id: department.id, label: department.name }))}
        placeholder="Select a department"
        isRequired
      />
      <label className="grid gap-1.5 text-xs font-semibold">
        Position title
        <input
          className="min-h-11 rounded-md border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus"
          name="positionTitle"
          required
          maxLength={120}
          placeholder="e.g. Instructor"
        />
      </label>
      {state.error ? (
        <p className="text-sm font-semibold text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <SubmitButton pendingLabel="Adding…">Add Faculty</SubmitButton>
    </form>
  )
}

export function AddFacultyButton({ departments }: { departments: Department[] }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  return (
    <>
      <Button className="whitespace-nowrap" onPress={() => setOpen(true)}>
        <Plus size={18} aria-hidden="true" className="mr-2" />
        Add Faculty
      </Button>
      {message ? (
        <p className="text-sm text-success" role="status">
          {message}
        </p>
      ) : null}
      <Modal title="Add Faculty" isOpen={open} onOpenChange={setOpen}>
        {open ? (
          <AddFacultyForm
            departments={departments}
            onSuccess={(successMessage) => {
              setMessage(successMessage)
              setOpen(false)
              router.refresh()
            }}
          />
        ) : null}
      </Modal>
    </>
  )
}
