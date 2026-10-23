'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from 'react-aria-components'
import { Info } from 'lucide-react'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/common/button/Button'
import { initialActionState } from '@/lib/actionState'
import { safeHttpUrl } from '@/lib/safeNavigation'
import { categoryLabel } from '../categories'
import { completeConsultationWithFeedback } from '../actions'
import type { ConsultationItem } from '../types'

const dayFormatter = new Intl.DateTimeFormat('en-PH', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'Asia/Manila',
})

const timeFormatter = new Intl.DateTimeFormat('en-PH', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'Asia/Manila',
})

function formatDay(date: string) {
  return dayFormatter.format(new Date(`${date}T00:00:00+08:00`))
}

function formatTimeRange(start: string, end: string) {
  const startDate = new Date(`1970-01-01T${start}+08:00`)
  const endDate = new Date(`1970-01-01T${end}+08:00`)
  return `${timeFormatter.format(startDate)}–${timeFormatter.format(endDate)}`
}

function modeLabel(item: Pick<ConsultationItem, 'mode' | 'location'>) {
  return item.mode === 'IN_PERSON' ? item.location || 'Not specified' : 'Online'
}

export function ConsultationDetailsDialog({
  item,
  viewer,
  onCompleted,
}: {
  item: ConsultationItem
  viewer: 'STUDENT' | 'FACULTY'
  onCompleted?: (id: string, outcome: string | null) => void
}) {
  const otherName = viewer === 'STUDENT' ? item.faculty_name : item.student_name
  const [confirming, setConfirming] = useState(false)
  const [outcome, setOutcome] = useState(item.outcome ?? '')
  const [savedOutcome, setSavedOutcome] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState(
    completeConsultationWithFeedback,
    initialActionState
  )
  const handledMessage = useRef<string | null>(null)

  const completed = savedOutcome !== null || item.consultation_status === 'COMPLETED'
  const status = completed ? 'COMPLETED' : item.consultation_status
  const meetingLink =
    item.meeting_link && ['APPROVED', 'COMPLETED'].includes(status)
      ? safeHttpUrl(item.meeting_link)
      : null
  const canComplete = viewer === 'FACULTY' && status === 'APPROVED'
  const savedNote = savedOutcome ?? item.outcome ?? ''

  useEffect(() => {
    if (!state.message || handledMessage.current === state.message) return
    handledMessage.current = state.message
    const note = outcome.trim() || null
    setSavedOutcome(note ?? '')
    setConfirming(false)
    onCompleted?.(item.id, note)
  }, [state.message, outcome, item.id, onCompleted])

  return (
    <DialogTrigger>
      <Button
        variant="secondary"
        size="compact"
        className="min-w-0"
        aria-label={`View consultation details with ${otherName}`}
      >
        View
      </Button>
      <ModalOverlay
        className="fixed inset-0 z-50 grid place-items-center bg-primary/55 p-4"
        isDismissable
      >
        <Modal className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-surface p-6 shadow-dialog">
          <Dialog role={confirming ? 'alertdialog' : 'dialog'} className="outline-none">
            {({ close }) =>
              confirming ? (
                <>
                  <Heading slot="title" className="text-xl font-semibold text-primary">
                    Mark consultation as completed?
                  </Heading>
                  <p className="mt-2 text-muted">
                    This saves the outcome note and closes the schedule slot. It cannot be undone.
                  </p>
                  {outcome.trim() ? (
                    <div className="mt-4 rounded-md border border-border bg-background p-3 text-sm">
                      <p className="font-semibold">Outcome note</p>
                      <p className="mt-1 whitespace-pre-wrap text-muted">{outcome.trim()}</p>
                    </div>
                  ) : null}
                  <form action={formAction} className="mt-6">
                    <input type="hidden" name="consultationId" value={item.id} />
                    <input type="hidden" name="outcome" value={outcome} />
                    <p className="min-h-5 text-sm font-semibold text-danger" role="alert">
                      {state.error}
                    </p>
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onPress={() => setConfirming(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" isDisabled={pending}>
                        {pending ? 'Completing…' : 'Mark as Completed'}
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <Heading slot="title" className="text-xl font-semibold text-primary">
                    Consultation details
                  </Heading>
                  <dl className="mt-4 divide-y divide-border border-y border-border text-sm [&>div]:grid [&>div]:gap-1 [&>div]:py-3 sm:[&>div]:grid-cols-[8rem_1fr]">
                    <div>
                      <dt className="font-semibold">Student</dt>
                      <dd>{item.student_name}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Faculty</dt>
                      <dd>{item.faculty_name}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Date and time</dt>
                      <dd>
                        {formatDay(item.slot_date)} ·{' '}
                        {formatTimeRange(item.start_time, item.end_time)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Mode</dt>
                      <dd>{modeLabel(item)}</dd>
                    </div>
                    {meetingLink ? (
                      <div>
                        <dt className="font-semibold">Meeting link</dt>
                        <dd>
                          <a
                            className="font-semibold text-primary underline"
                            href={meetingLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Join online consultation
                          </a>
                        </dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="font-semibold">Status</dt>
                      <dd>
                        <StatusBadge status={status} />
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Category</dt>
                      <dd>{categoryLabel(item.category)}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Description</dt>
                      <dd className="whitespace-pre-wrap">{item.notes || 'None provided'}</dd>
                    </div>
                  </dl>

                  {completed ? (
                    <div className="mt-5">
                      <p className="text-sm font-semibold">Outcome note</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
                        {savedNote || 'No outcome note recorded.'}
                      </p>
                    </div>
                  ) : null}

                  {savedOutcome !== null ? (
                    <p
                      className="mt-4 rounded-md bg-emerald-50 p-3 text-sm font-semibold text-success"
                      role="status"
                    >
                      {state.message}
                    </p>
                  ) : null}

                  {canComplete ? (
                    <div className="mt-5">
                      <label htmlFor={`outcome-${item.id}`} className="text-sm font-semibold">
                        Outcome Note
                      </label>
                      <textarea
                        id={`outcome-${item.id}`}
                        value={outcome}
                        onChange={(event) => setOutcome(event.target.value)}
                        maxLength={2000}
                        rows={4}
                        placeholder="Add notes about the consultation outcome."
                        className="mt-1.5 w-full rounded-md border border-border bg-surface p-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-focus"
                      />
                      <p className="mt-3 flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                        <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                        This consultation can only be marked as completed because it is approved.
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-6 flex justify-end gap-3">
                    <Button variant="secondary" onPress={close}>
                      {canComplete ? 'Cancel' : 'Close'}
                    </Button>
                    {canComplete ? (
                      <Button onPress={() => setConfirming(true)}>Mark as Completed</Button>
                    ) : null}
                  </div>
                </>
              )
            }
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}
