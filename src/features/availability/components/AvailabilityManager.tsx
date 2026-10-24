'use client'

import { useActionState, useState } from 'react'
import { Cell, Column, Row, TableBody, TableHeader } from 'react-aria-components'
import { CalendarPlus, MapPin, Monitor } from 'lucide-react'
import { SearchInput } from '@/components/common/SearchInput'
import { Button } from '@/components/common/button/Button'
import { AlertDialog } from '@/components/common/AlertDialog'
import { DataTable } from '@/components/common/table/DataTable'
import { PageHeading } from '@/components/common/PageHeading'
import { StatusBadge } from '@/components/common/StatusBadge'
import { SubmitButton } from '@/components/common/SubmitButton'
import { Modal } from '@/components/common/modal/Modal'
import { Select } from '@/components/common/select/Select'
import { initialActionState, type ActionState } from '@/lib/actionState'
import { safeHttpUrl } from '@/lib/safeNavigation'
import { categoryLabel } from '@/features/consultations/categories'
import { createAvailability, deleteAvailability, updateAvailability } from '../actions'
import type { AvailabilityItem } from '../repositories/availabilityRepository'

const fieldClass = 'grid gap-1.5 text-xs font-semibold'
const controlClass =
  'min-h-11 rounded-md border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus'

const modeOptions = [
  { id: 'IN_PERSON', label: 'In person' },
  { id: 'ONLINE', label: 'Online' },
]

const statusOptions = [
  { id: 'ALL', label: 'All Statuses' },
  { id: 'OPEN', label: 'Open' },
  { id: 'RESERVED', label: 'Reserved' },
  { id: 'BOOKED', label: 'Booked' },
  { id: 'CLOSED', label: 'Closed' },
]

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
})

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00`))
}

export function AvailabilityManager({ slots }: { slots: AvailabilityItem[] }) {
  const [addOpen, setAddOpen] = useState(false)
  const [editSlot, setEditSlot] = useState<AvailabilityItem | null>(null)
  const [detailsSlot, setDetailsSlot] = useState<AvailabilityItem | null>(null)
  const [search, setSearch] = useState('')
  const [feedback, setFeedback] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | AvailabilityItem['status']>('ALL')
  const [state, formAction] = useActionState(async (previous: ActionState, formData: FormData) => {
    const result = await createAvailability(previous, formData)
    if (!result.error) {
      setAddOpen(false)
      setFeedback('Availability added.')
    }
    return result
  }, initialActionState)
  const [editState, editAction] = useActionState(
    async (previous: ActionState, formData: FormData) => {
      const result = await updateAvailability(previous, formData)
      if (!result.error) {
        setEditSlot(null)
        setFeedback('Availability updated.')
      }
      return result
    },
    initialActionState
  )
  const query = search.trim().toLowerCase()
  const visibleSlots = slots.filter((slot) => {
    if (statusFilter !== 'ALL' && slot.status !== statusFilter) return false
    if (!query) return true
    return [
      slot.student_name ?? '',
      slot.category ? categoryLabel(slot.category) : '',
      slot.location ?? '',
      slot.mode === 'ONLINE' ? 'online' : '',
    ].some((value) => value.toLowerCase().includes(query))
  })

  return (
    <div data-faculty-list="availability">
      <PageHeading
        eyebrow="Faculty workspace"
        title="My Availability"
        description="Create consultation times and review their booking status."
        action={
          <Button onPress={() => setAddOpen(true)}>
            <CalendarPlus size={16} aria-hidden="true" className="mr-2" />
            Add Availability
          </Button>
        }
      />
      <div className="grid items-end gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <SearchInput
          label="Search availability"
          value={search}
          onChange={setSearch}
          placeholder="Student, category, or location"
        />
        <Select
          label="Filter by status"
          options={statusOptions}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as 'ALL' | AvailabilityItem['status'])}
        />
      </div>
      <Modal
        title="Add Availability"
        isOpen={addOpen}
        onOpenChange={setAddOpen}
        className="max-w-3xl"
      >
        <p className="text-muted">
          Choose a date and time, then add the room or online meeting details.
        </p>
        <form action={formAction} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4 sm:col-span-2 lg:col-span-3">
            <Button type="button" variant="secondary" onPress={() => setAddOpen(false)}>
              Cancel
            </Button>
            <SubmitButton className="w-auto" pendingLabel="Adding…">
              Add availability
            </SubmitButton>
          </div>
        </form>
      </Modal>
      {feedback && (
        <p
          role="status"
          className="mt-4 rounded-lg border border-success/20 bg-success/8 px-4 py-3 text-sm text-success"
        >
          {feedback}
        </p>
      )}
      <div className="mt-5">
        <p className="mb-3 text-xs text-muted" role="status">
          {visibleSlots.length} of {slots.length} upcoming slots
        </p>
        <DataTable aria-label="Upcoming availability">
          <TableHeader className="border-b border-border bg-background text-xs font-semibold tracking-wide text-muted uppercase">
            <Column isRowHeader className="w-[22%] px-5 py-3">
              Schedule
            </Column>
            <Column className="w-[18%] px-5 py-3">Mode / location</Column>
            <Column className="w-[12%] px-5 py-3">Status</Column>
            <Column className="w-[25%] px-5 py-3">Linked request or student</Column>
            <Column className="w-[23%] px-5 py-3 text-right">Actions</Column>
          </TableHeader>
          <TableBody
            items={visibleSlots}
            renderEmptyState={() =>
              slots.length === 0
                ? 'No upcoming availability.'
                : 'No availability matches your filters.'
            }
          >
            {(slot) => (
              <Row className="border-b border-border last:border-0 data-[focus-visible-within]:outline-3 data-[focus-visible-within]:outline-focus">
                <Cell className="px-5 py-4">
                  <p className="font-semibold text-primary">
                    <time dateTime={slot.date}>{formatDate(slot.date)}</time>
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                  </p>
                </Cell>
                <Cell data-label="Mode / location" className="px-5 py-4 text-sm text-muted">
                  <span className="flex items-center gap-2">
                    {slot.mode === 'IN_PERSON' ? (
                      <MapPin size={16} aria-hidden="true" />
                    ) : (
                      <Monitor size={16} aria-hidden="true" />
                    )}
                    {slot.mode === 'IN_PERSON' ? slot.location || 'Not specified' : 'Online'}
                  </span>
                </Cell>
                <Cell data-label="Status" className="px-5 py-4">
                  <StatusBadge status={slot.status} />
                </Cell>
                <Cell data-label="Student" className="px-5 py-4">
                  {slot.student_name ? (
                    <>
                      <p className="font-semibold text-primary">{slot.student_name}</p>
                      {slot.category ? (
                        <p className="mt-1 text-sm text-muted">{categoryLabel(slot.category)}</p>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </Cell>
                <Cell data-label="Actions" className="px-5 py-4">
                  {slot.status === 'BOOKED' || slot.status === 'RESERVED' ? (
                    <div className="flex justify-end">
                      <Button
                        variant="secondary"
                        size="compact"
                        className="min-w-0"
                        onPress={() => setDetailsSlot(slot)}
                      >
                        View
                      </Button>
                    </div>
                  ) : slot.has_history ? (
                    <span
                      className="block text-right text-sm text-muted"
                      title="This slot has consultation history and cannot be edited."
                    >
                      History
                    </span>
                  ) : slot.status === 'OPEN' ? (
                    <div className="flex flex-nowrap items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="compact"
                        className="min-w-0"
                        onPress={() => setEditSlot(slot)}
                      >
                        Edit
                      </Button>
                      <AlertDialog
                        label="Remove"
                        title="Remove availability?"
                        description="Students will no longer be able to request this time."
                        fields={{ slotId: slot.id }}
                        submitAction={deleteAvailability}
                        onSuccess={() => setFeedback('Availability removed.')}
                        variant="danger"
                      />
                    </div>
                  ) : (
                    <span className="block text-right text-sm text-muted">No actions</span>
                  )}
                </Cell>
              </Row>
            )}
          </TableBody>
        </DataTable>
      </div>
      <Modal
        title="Edit availability"
        isOpen={editSlot !== null}
        onOpenChange={(open) => {
          if (!open) setEditSlot(null)
        }}
        className="max-w-3xl"
      >
        {editSlot ? (
          <form
            key={editSlot.id}
            action={editAction}
            className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <input type="hidden" name="slotId" value={editSlot.id} />
            <label className={fieldClass}>
              Date
              <input
                className={controlClass}
                name="date"
                type="date"
                required
                defaultValue={editSlot.date}
              />
            </label>
            <label className={fieldClass}>
              Start
              <input
                className={controlClass}
                name="startTime"
                type="time"
                required
                defaultValue={editSlot.start_time.slice(0, 5)}
              />
            </label>
            <label className={fieldClass}>
              End
              <input
                className={controlClass}
                name="endTime"
                type="time"
                required
                defaultValue={editSlot.end_time.slice(0, 5)}
              />
            </label>
            <Select
              label="Mode"
              name="mode"
              options={modeOptions}
              defaultValue={editSlot.mode}
              isRequired
            />
            <label className={fieldClass}>
              Location
              <input
                className={controlClass}
                name="location"
                maxLength={160}
                defaultValue={editSlot.location ?? ''}
              />
            </label>
            <label className={fieldClass}>
              Meeting link
              <input
                className={controlClass}
                name="meetingLink"
                type="url"
                defaultValue={editSlot.meeting_link ?? ''}
              />
            </label>
            <p
              className="min-h-5 text-sm font-semibold text-danger sm:col-span-2 lg:col-span-3"
              role="alert"
            >
              {editState.error}
            </p>
            <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4 sm:col-span-2 lg:col-span-3">
              <Button type="button" variant="secondary" onPress={() => setEditSlot(null)}>
                Cancel
              </Button>
              <SubmitButton className="w-auto" pendingLabel="Saving…">
                Save changes
              </SubmitButton>
            </div>
          </form>
        ) : null}
      </Modal>
      <Modal
        title="Availability details"
        isOpen={detailsSlot !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsSlot(null)
        }}
      >
        {detailsSlot ? (
          <dl className="mt-2 grid grid-cols-[6rem_minmax(0,1fr)] text-sm [&>dd]:break-words [&>dd]:m-0 [&>dd]:border-b [&>dd]:border-border [&>dd]:p-2 [&>dt]:border-b [&>dt]:border-border [&>dt]:p-2 [&>dt]:font-bold">
            <dt>Date</dt>
            <dd>{formatDate(detailsSlot.date)}</dd>
            <dt>Time</dt>
            <dd>
              {detailsSlot.start_time.slice(0, 5)}–{detailsSlot.end_time.slice(0, 5)}
            </dd>
            <dt>Status</dt>
            <dd>
              <StatusBadge status={detailsSlot.status} />
            </dd>
            <dt>Mode</dt>
            <dd>
              {detailsSlot.mode === 'IN_PERSON'
                ? detailsSlot.location || 'Not specified'
                : 'Online'}
            </dd>
            {detailsSlot.student_name ? (
              <>
                <dt>Student</dt>
                <dd>{detailsSlot.student_name}</dd>
              </>
            ) : null}
            {detailsSlot.category ? (
              <>
                <dt>Category</dt>
                <dd>{categoryLabel(detailsSlot.category)}</dd>
              </>
            ) : null}
            {safeHttpUrl(detailsSlot.meeting_link) ? (
              <>
                <dt>Meeting link</dt>
                <dd>
                  <a
                    className="font-semibold text-primary underline"
                    href={safeHttpUrl(detailsSlot.meeting_link) ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Join meeting
                  </a>
                </dd>
              </>
            ) : null}
          </dl>
        ) : null}
      </Modal>
    </div>
  )
}
