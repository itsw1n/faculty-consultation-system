'use client'

import { useActionState } from 'react'
import { Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from 'react-aria-components'
import { Button } from '@/components/common/Button'
import { ConfirmAction } from '@/components/common/ConfirmAction'
import { StatusBadge } from '@/components/common/StatusBadge'
import { SubmitButton } from '@/components/common/SubmitButton'
import { initialActionState } from '@/lib/actionState'
import { createAvailability, deleteAvailability } from '../actions'
import type { AvailabilityItem } from '../repositories/availabilityRepository'

const fieldClass = 'grid gap-1.5 text-xs font-bold'
const controlClass = 'min-h-11 rounded-lg border border-border bg-surface px-3 outline-none focus-visible:ring-3 focus-visible:ring-focus'
const overlayClass = 'fixed inset-0 z-50 grid place-items-center bg-primary/55 p-4'

export function AvailabilityManager({ slots }: { slots: AvailabilityItem[] }) {
  const [state, formAction] = useActionState(createAvailability, initialActionState)

  return <>
    <DialogTrigger><Button>Add Availability</Button><ModalOverlay className={overlayClass} isDismissable><Modal className="w-full max-w-3xl rounded-xl bg-surface p-6 shadow-dialog"><Dialog className="outline-none">{({ close }) => <><Heading slot="title" className="text-2xl font-bold">Add Availability</Heading><p className="mt-2 text-muted">Create an open time for student requests.</p><form action={formAction} className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><label className={fieldClass}>Date<input className={controlClass} name="date" type="date" required/></label><label className={fieldClass}>Start<input className={controlClass} name="startTime" type="time" required/></label><label className={fieldClass}>End<input className={controlClass} name="endTime" type="time" required/></label><label className={fieldClass}>Mode<select className={controlClass} name="mode" required><option value="IN_PERSON">In person</option><option value="ONLINE">Online</option></select></label><label className={fieldClass}>Location<input className={controlClass} name="location" maxLength={160}/></label><label className={fieldClass}>Meeting link<input className={controlClass} name="meetingLink" type="url"/></label><p className="min-h-5 text-sm font-semibold text-danger sm:col-span-2 lg:col-span-3" role="alert">{state.error}</p><div className="flex justify-end gap-3 sm:col-span-2 lg:col-span-3"><Button type="button" variant="secondary" onPress={close}>Cancel</Button><SubmitButton pendingLabel="Adding…">Add availability</SubmitButton></div></form></>}</Dialog></Modal></ModalOverlay></DialogTrigger>
    <section className="mt-4 overflow-hidden rounded-xl border border-border bg-surface" aria-label="Upcoming availability">{slots.length === 0 ? <p className="p-8 text-center text-muted">No upcoming availability.</p> : slots.map((slot) => <article className="grid items-center gap-3 border-b border-border p-4 last:border-0 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_.7fr_1fr_auto]" key={slot.id}><DialogTrigger><Button variant="ghost" className="justify-start px-0 text-left"><time dateTime={slot.date}>{new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(new Date(`${slot.date}T00:00:00`))}</time></Button><ModalOverlay className={overlayClass} isDismissable><Modal className="w-full max-w-lg rounded-xl bg-surface p-6 shadow-dialog"><Dialog className="outline-none"><Heading slot="title" className="text-xl font-bold">Availability details</Heading><dl className="mt-4 grid grid-cols-[7rem_1fr] [&>dd]:m-0 [&>dd]:border-b [&>dd]:border-border [&>dd]:p-2 [&>dt]:border-b [&>dt]:border-border [&>dt]:p-2 [&>dt]:font-bold"><dt>Date</dt><dd>{slot.date}</dd><dt>Time</dt><dd>{slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}</dd><dt>Status</dt><dd>{slot.status}</dd><dt>Mode</dt><dd>{slot.mode === 'IN_PERSON' ? slot.location : 'Online'}</dd></dl></Dialog></Modal></ModalOverlay></DialogTrigger><strong>{slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}</strong><StatusBadge status={slot.status}/><span>{slot.mode === 'IN_PERSON' ? slot.location : 'Online'}</span>{slot.status === 'OPEN' && <ConfirmAction label="Remove" title="Remove availability?" description="Students will no longer be able to request this time." fields={{ slotId: slot.id }} submitAction={deleteAvailability} variant="danger"/>}</article>)}</section>
  </>
}
