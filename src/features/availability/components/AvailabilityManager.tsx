'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/common/Button'
import { AlertDialog } from '@/components/common/AlertDialog'
import { StatusBadge } from '@/components/common/StatusBadge'
import { SubmitButton } from '@/components/common/SubmitButton'
import { Modal } from '@/components/layout/modal/Modal'
import { Select } from '@/components/ui/select/Select'
import { initialActionState } from '@/lib/actionState'
import { createAvailability, deleteAvailability } from '../actions'
import type { AvailabilityItem } from '../repositories/availabilityRepository'

const fieldClass = 'grid gap-1.5 text-xs font-bold'
const controlClass =
  'min-h-11 rounded-lg border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus'

const modeOptions = [
  { id: 'IN_PERSON', label: 'In person' },
  { id: 'ONLINE', label: 'Online' },
]

export function AvailabilityManager({ slots }: { slots: AvailabilityItem[] }) {
  const [state, formAction] = useActionState(createAvailability, initialActionState)
  const [addOpen, setAddOpen] = useState(false)
  const [detailsSlot, setDetailsSlot] = useState<AvailabilityItem | null>(null)

  return (
    <>
      <Button onPress={() => setAddOpen(true)}>Add Availability</Button>
      <Modal
        title="Add Availability"
        isOpen={addOpen}
        onOpenChange={setAddOpen}
        className="max-w-3xl"
      >
        <p className="text-muted">Create an open time for student requests.</p>
        <form action={formAction} className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className={fieldClass}>
            Date
            <input className={controlClass} name="date" type="date" required />
          </label>
          <label className={fieldClass}>
            Start
            <input className={controlClass} name="startTime" type="time" required />
          </label>
          <label className={fieldClass}>
            End
            <input className={controlClass} name="endTime" type="time" required />
          </label>
          <Select
            label="Mode"
            name="mode"
            options={modeOptions}
            defaultValue="IN_PERSON"
            isRequired
          />
          <label className={fieldClass}>
            Location
            <input className={controlClass} name="location" maxLength={160} />
          </label>
          <label className={fieldClass}>
            Meeting link
            <input className={controlClass} name="meetingLink" type="url" />
          </label>
          <p
            className="min-h-5 text-sm font-semibold text-danger sm:col-span-2 lg:col-span-3"
            role="alert"
          >
            {state.error}
          </p>
          <div className="flex justify-end gap-3 sm:col-span-2 lg:col-span-3">
            <Button type="button" variant="secondary" onPress={() => setAddOpen(false)}>
              Cancel
            </Button>
            <SubmitButton pendingLabel="Adding…">Add availability</SubmitButton>
          </div>
        </form>
      </Modal>
      <section
        className="mt-4 overflow-hidden rounded-xl border border-border bg-surface"
        aria-label="Upcoming availability"
      >
        {slots.length === 0 ? (
          <p className="p-8 text-center text-muted">No upcoming availability.</p>
        ) : (
          slots.map((slot) => (
            <article
              className="grid items-center gap-3 border-b border-border p-4 last:border-0 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_.7fr_1fr_auto]"
              key={slot.id}
            >
              <Button
                variant="ghost"
                className="justify-start px-0 text-left"
                onPress={() => setDetailsSlot(slot)}
              >
                <time dateTime={slot.date}>
                  {new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(
                    new Date(`${slot.date}T00:00:00`)
                  )}
                </time>
              </Button>
              <strong>
                {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
              </strong>
              <StatusBadge status={slot.status} />
              <span>{slot.mode === 'IN_PERSON' ? slot.location : 'Online'}</span>
              {slot.status === 'OPEN' && (
                <AlertDialog
                  label="Remove"
                  title="Remove availability?"
                  description="Students will no longer be able to request this time."
                  fields={{ slotId: slot.id }}
                  submitAction={deleteAvailability}
                  variant="danger"
                />
              )}
            </article>
          ))
        )}
      </section>
      <Modal
        title="Availability details"
        isOpen={detailsSlot !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsSlot(null)
        }}
      >
        {detailsSlot ? (
          <dl className="mt-2 grid grid-cols-[7rem_1fr] [&>dd]:m-0 [&>dd]:border-b [&>dd]:border-border [&>dd]:p-2 [&>dt]:border-b [&>dt]:border-border [&>dt]:p-2 [&>dt]:font-bold">
            <dt>Date</dt>
            <dd>{detailsSlot.date}</dd>
            <dt>Time</dt>
            <dd>
              {detailsSlot.start_time.slice(0, 5)}–{detailsSlot.end_time.slice(0, 5)}
            </dd>
            <dt>Status</dt>
            <dd>{detailsSlot.status}</dd>
            <dt>Mode</dt>
            <dd>{detailsSlot.mode === 'IN_PERSON' ? detailsSlot.location : 'Online'}</dd>
          </dl>
        ) : null}
      </Modal>
    </>
  )
}
