'use client'
import { useActionState, useMemo, useState } from 'react'
import { SubmitButton } from '@/components/common/SubmitButton'
import { initialActionState } from '@/lib/actionState'
import { bookConsultation } from '../actions'
import type { SlotResult } from '../repositories/bookingRepository'
import { cn } from '@/lib/cn'
type Step = 'schedule' | 'details' | 'review'
const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
function monday(date: Date) {
  const value = new Date(date)
  const day = value.getDay() || 7
  value.setDate(value.getDate() - day + 1)
  value.setHours(0, 0, 0, 0)
  return value
}
export function BookingWizard({ slots }: { slots: SlotResult[] }) {
  const [state, formAction] = useActionState(bookConsultation, initialActionState)
  const [step, setStep] = useState<Step>('schedule')
  const [selectedId, setSelectedId] = useState('')
  const [purpose, setPurpose] = useState('')
  const [notes, setNotes] = useState('')
  const [weekOffset, setWeekOffset] = useState(0)
  const [mobileDay, setMobileDay] = useState(0)
  const selected = slots.find((slot) => slot.id === selectedId)
  const week = useMemo(() => {
    const start = monday(new Date())
    start.setDate(start.getDate() + weekOffset * 7)
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start)
      date.setDate(date.getDate() + index)
      const dateKey = iso(date)
      return { date, dateKey, slots: slots.filter((slot) => slot.slot_date === dateKey) }
    })
  }, [slots, weekOffset])
  if (!slots.length)
    return (
      <p className="rounded-xl border border-border bg-surface p-8 text-center text-muted">
        No schedules in the next four weeks.
      </p>
    )
  const navButton =
    'min-h-10 rounded-lg border border-border bg-surface px-3 text-sm font-bold text-primary disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-focus'
  const nextButton =
    'mt-4 ml-auto block min-h-11 rounded-lg bg-primary px-5 py-2 font-bold text-white disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-focus'
  const field = 'grid gap-2 font-bold'
  const control =
    'rounded-lg border border-border bg-surface p-3 outline-none focus-visible:ring-3 focus-visible:ring-focus'
  return (
    <section>
      <ol className="mb-4 flex list-none gap-2 p-0" aria-label="Booking progress">
        {[
          ['schedule', '1 Schedule'],
          ['details', '2 Details'],
          ['review', '3 Review'],
        ].map(([value, label]) => (
          <li
            className={cn(
              'flex-1 border-b-3 border-border p-2 text-center text-xs font-bold text-muted sm:text-sm',
              step === value && 'border-primary text-primary'
            )}
            aria-current={step === value ? 'step' : undefined}
            key={value}
          >
            {label}
          </li>
        ))}
      </ol>
      {step === 'schedule' && (
        <>
          <div className="mb-3 flex justify-between gap-2 sm:justify-end">
            <button
              className={navButton}
              disabled={weekOffset === 0}
              onClick={() => {
                setWeekOffset((value) => value - 1)
                setMobileDay(0)
              }}
            >
              Previous week
            </button>
            <button
              className={navButton}
              onClick={() => {
                setWeekOffset(0)
                setMobileDay(0)
              }}
            >
              Today
            </button>
            <button
              className={navButton}
              disabled={weekOffset >= 3}
              onClick={() => {
                setWeekOffset((value) => value + 1)
                setMobileDay(0)
              }}
            >
              Next week
            </button>
          </div>
          <div
            className="mb-3 flex gap-1 overflow-x-auto sm:hidden"
            role="tablist"
            aria-label="Choose day"
          >
            {week.map((day, index) => (
              <button
                className={cn(
                  navButton,
                  'min-w-17',
                  mobileDay === index && 'bg-primary text-white'
                )}
                role="tab"
                aria-selected={mobileDay === index}
                key={day.dateKey}
                onClick={() => setMobileDay(index)}
              >
                {new Intl.DateTimeFormat('en-PH', { weekday: 'short', day: 'numeric' }).format(
                  day.date
                )}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
            {week.map((day, index) => (
              <section
                className={cn(
                  'min-h-48 rounded-xl border border-border bg-surface p-3',
                  mobileDay !== index && 'hidden sm:block'
                )}
                key={day.dateKey}
              >
                <h2 className="mb-3 text-sm font-bold">
                  {new Intl.DateTimeFormat('en-PH', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  }).format(day.date)}
                </h2>
                {day.slots.length === 0 ? (
                  <p className="text-xs text-muted">No slots</p>
                ) : (
                  day.slots.map((slot) => (
                    <button
                      key={slot.id}
                      disabled={slot.slot_status !== 'OPEN'}
                      aria-pressed={selectedId === slot.id}
                      className={cn(
                        'my-2 grid w-full gap-1 rounded-lg border border-border p-3 text-left text-success disabled:cursor-not-allowed focus-visible:outline-3 focus-visible:outline-accent',
                        slot.slot_status === 'OPEN' && 'bg-emerald-50',
                        slot.slot_status === 'RESERVED' && 'bg-amber-50 text-warning',
                        slot.slot_status === 'BOOKED' && 'bg-blue-50 text-blue-800',
                        slot.slot_status === 'CLOSED' && 'bg-slate-100 text-muted',
                        selectedId === slot.id && 'ring-3 ring-accent'
                      )}
                      onClick={() => setSelectedId(slot.id)}
                    >
                      <strong>
                        {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                      </strong>
                      <span className="text-xs font-extrabold">{slot.slot_status}</span>
                    </button>
                  ))
                )}
              </section>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold" aria-label="Schedule legend">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-success">Open</span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-warning">Reserved</span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-800">Booked</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-muted">Closed</span>
          </div>
          <button className={nextButton} disabled={!selected} onClick={() => setStep('details')}>
            Continue
          </button>
        </>
      )}
      {step === 'details' && (
        <div className="max-w-2xl rounded-xl border border-border bg-surface p-6">
          <button className="font-bold text-primary" onClick={() => setStep('schedule')}>
            Back to schedule
          </button>
          <label className={cn(field, 'mt-5')}>
            Purpose
            <input
              className={control}
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              required
              maxLength={200}
            />
          </label>
          <label className={cn(field, 'mt-4')}>
            Details
            <textarea
              className={cn(control, 'min-h-32 resize-y')}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={2000}
            />
          </label>
          <button
            className={nextButton}
            disabled={!purpose.trim()}
            onClick={() => setStep('review')}
          >
            Review request
          </button>
        </div>
      )}
      {step === 'review' && selected && (
        <div className="max-w-2xl rounded-xl border border-border bg-surface p-6">
          <button className="font-bold text-primary" onClick={() => setStep('details')}>
            Back to details
          </button>
          <h2 className="mt-4 text-xl font-bold">Review your request</h2>
          <dl className="mt-3 [&>div]:grid [&>div]:grid-cols-1 [&>div]:border-b [&>div]:border-border [&>div]:py-3 sm:[&>div]:grid-cols-[8rem_1fr] [&_dd]:m-0 [&_dt]:font-bold">
            <div>
              <dt>Date</dt>
              <dd>{selected.slot_date}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>
                {selected.start_time.slice(0, 5)}–{selected.end_time.slice(0, 5)}
              </dd>
            </div>
            <div>
              <dt>Mode</dt>
              <dd>{selected.mode === 'IN_PERSON' ? selected.location : 'Online'}</dd>
            </div>
            <div>
              <dt>Purpose</dt>
              <dd>{purpose}</dd>
            </div>
          </dl>
          <form action={formAction}>
            <input type="hidden" name="slotId" value={selected.id} />
            <input type="hidden" name="purpose" value={purpose} />
            <input type="hidden" name="notes" value={notes} />
            <p className="my-2 min-h-5 text-sm font-semibold text-danger" role="alert">
              {state.error}
            </p>
            <SubmitButton pendingLabel="Requesting…">Confirm booking request</SubmitButton>
          </form>
        </div>
      )}
    </section>
  )
}
