'use client'

import { useActionState, useCallback, useMemo, useRef, useState } from 'react'
import {
  endOfMonth,
  parseDate,
  startOfMonth,
  today,
  type CalendarDate,
} from '@internationalized/date'
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  Clock,
  FileText,
  Info,
  MapPin,
  RefreshCw,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/common/button/Button'
import { SubmitButton } from '@/components/common/SubmitButton'
import { Select } from '@/components/common/select/Select'
import { StatusBadge } from '@/components/common/StatusBadge'
import { initialActionState } from '@/lib/actionState'
import { cn } from '@/lib/cn'
import { addDays, isPastSlot, manilaDateKey } from '@/lib/manilaTime'
import {
  categories,
  categoryLabel,
  type ConsultationCategory,
} from '@/features/consultations/categories'
import { bookConsultation } from '../actions'
import type { SlotResult } from '../types'
import { BookingCalendar } from './BookingCalendar'

type Step = 'schedule' | 'details' | 'review'

const TODAY = today('Asia/Manila')

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'Asia/Manila',
})

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00+08:00`))
}

function formatTimeRange(start: string, end: string) {
  return `${start.slice(0, 5)}–${end.slice(0, 5)}`
}

function modeLabel(slot: SlotResult) {
  return slot.mode === 'IN_PERSON' ? slot.location || 'Not specified' : 'Online'
}

function monthKey(date: CalendarDate) {
  return `${date.year}-${String(date.month).padStart(2, '0')}`
}

function isOpenSlot(slot: SlotResult) {
  return slot.slot_status === 'OPEN' && !isPastSlot(slot.slot_date, slot.start_time)
}

const steps: { value: Step; label: string }[] = [
  { value: 'schedule', label: 'Schedule' },
  { value: 'details', label: 'Details' },
  { value: 'review', label: 'Review' },
]

const field = 'grid gap-2 text-sm font-semibold'
const control =
  'rounded-md border border-border bg-surface p-3 text-sm font-normal outline-none transition-colors focus-visible:ring-3 focus-visible:ring-focus'

export function BookingWizard({
  facultyId,
  initialSlots,
}: {
  facultyId: string
  initialSlots: SlotResult[]
}) {
  const [state, formAction] = useActionState(bookConsultation, initialActionState)
  const initialDate =
    initialSlots.find(isOpenSlot)?.slot_date ??
    initialSlots.find((slot) => !isPastSlot(slot.slot_date, slot.start_time))?.slot_date ??
    TODAY.toString()
  const [slots, setSlots] = useState(initialSlots)
  const [step, setStep] = useState<Step>('schedule')
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [focusedDate, setFocusedDate] = useState<CalendarDate>(() => parseDate(initialDate))
  const [selectedId, setSelectedId] = useState('')
  const [category, setCategory] = useState<ConsultationCategory | ''>('')
  const [notes, setNotes] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMonthLoading, setIsMonthLoading] = useState(false)
  const [scheduleError, setScheduleError] = useState<string | null>(null)
  const requestId = useRef(0)

  const selected = slots.find((slot) => slot.id === selectedId)
  const slotsForDate = useMemo(
    () =>
      slots
        .filter((slot) => slot.slot_date === selectedDate)
        .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [slots, selectedDate]
  )
  const openSlots = slotsForDate.filter(isOpenSlot)
  const facultyName = slots.find((slot) => slot.faculty_name)?.faculty_name ?? 'Selected faculty'
  const selectedOpen = selected ? isOpenSlot(selected) : false

  const fetchMonth = useCallback(
    async (date: CalendarDate) => {
      const currentRequest = ++requestId.current
      const start = startOfMonth(date).subtract({ days: 7 }).toString()
      const end = endOfMonth(date).add({ days: 7 }).toString()
      setIsMonthLoading(true)
      setScheduleError(null)
      try {
        const response = await fetch(
          `/api/faculty/${facultyId}/availability?start=${start}&end=${end}`
        )
        const body = (await response.json()) as { slots?: unknown }
        if (!response.ok || !Array.isArray(body.slots)) throw new Error('refresh failed')
        if (currentRequest !== requestId.current) return
        const fresh = body.slots as SlotResult[]
        setSlots((previous) => {
          const outsideRange = previous.filter(
            (slot) => slot.slot_date < start || slot.slot_date > end
          )
          return [...outsideRange, ...fresh].sort(
            (a, b) =>
              a.slot_date.localeCompare(b.slot_date) || a.start_time.localeCompare(b.start_time)
          )
        })
      } catch {
        if (currentRequest === requestId.current) {
          setScheduleError('Could not load availability for this month. Please try again.')
        }
      } finally {
        if (currentRequest === requestId.current) setIsMonthLoading(false)
      }
    },
    [facultyId]
  )

  async function refreshSchedules() {
    const currentRequest = ++requestId.current
    const start = manilaDateKey()
    const end = addDays(start, 28)
    setIsRefreshing(true)
    setScheduleError(null)
    try {
      const response = await fetch(`/api/faculty/${facultyId}/availability`)
      const body = (await response.json()) as { slots?: unknown }
      if (!response.ok || !Array.isArray(body.slots)) throw new Error('refresh failed')
      if (currentRequest !== requestId.current) return
      const fresh = body.slots as SlotResult[]
      const outsideRange = slots.filter((slot) => slot.slot_date < start || slot.slot_date > end)
      const merged = [...outsideRange, ...fresh].sort(
        (a, b) => a.slot_date.localeCompare(b.slot_date) || a.start_time.localeCompare(b.start_time)
      )
      setSlots(merged)
      setSelectedId((current) =>
        merged.some((slot) => slot.id === current && isOpenSlot(slot)) ? current : ''
      )
    } catch {
      if (currentRequest === requestId.current) {
        setScheduleError('Could not refresh schedules. Showing last loaded times.')
      }
    } finally {
      if (currentRequest === requestId.current) setIsRefreshing(false)
    }
  }

  function changeFocusedDate(date: CalendarDate) {
    const nextMonth = monthKey(date)
    if (nextMonth !== monthKey(focusedDate)) {
      if (monthKey(parseDate(selectedDate)) !== nextMonth) {
        setSelectedDate(date.toString())
        setSelectedId('')
      }
      void fetchMonth(date)
    }
    setFocusedDate(date)
  }

  function chooseDate(value: string) {
    setSelectedDate(value)
    setSelectedId((current) =>
      slots.find((slot) => slot.id === current)?.slot_date === value ? current : ''
    )
  }

  function goToToday() {
    const key = TODAY.toString()
    changeFocusedDate(TODAY)
    if (selectedDate !== key) {
      setSelectedDate(key)
      setSelectedId('')
    }
  }

  function chooseSlot(slot: SlotResult) {
    if (!isOpenSlot(slot)) return
    setSelectedId(slot.id)
  }

  const currentStep = steps.findIndex((item) => item.value === step)

  return (
    <section>
      <ol className="mb-6 flex list-none items-center p-0" aria-label="Booking progress">
        {steps.map((item, index) => {
          const complete = index < currentStep
          const current = item.value === step
          return (
            <li
              className={cn('flex items-center', index < steps.length - 1 && 'flex-1')}
              aria-current={current ? 'step' : undefined}
              key={item.value}
            >
              <span
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full border text-sm font-bold transition-colors',
                  complete && 'border-primary bg-primary text-white',
                  current && 'border-primary bg-primary text-white',
                  !complete && !current && 'border-border bg-surface text-muted'
                )}
                aria-hidden="true"
              >
                {complete ? <Check size={16} /> : index + 1}
              </span>
              <span
                className={cn(
                  'ml-2 text-xs font-semibold sm:text-sm',
                  current || complete ? 'text-primary' : 'text-muted'
                )}
              >
                {item.label}
              </span>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn('mx-2 h-px flex-1 sm:mx-3', complete ? 'bg-primary' : 'bg-border')}
                />
              ) : null}
            </li>
          )
        })}
      </ol>

      {step === 'schedule' ? (
        <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <BookingCalendar
            slots={slots}
            selectedDate={selectedDate}
            focusedDate={focusedDate}
            onSelectDate={chooseDate}
            onFocusDateChange={changeFocusedDate}
            onToday={goToToday}
          />

          <section className="flex flex-col rounded-lg border border-border bg-surface">
            <header className="border-b border-border p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-subtle text-accent">
                    <Clock size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-primary">Available Time Slots</h2>
                    <p className="mt-0.5 text-sm text-muted">{formatDate(selectedDate)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="compact"
                  className="min-w-0 px-2"
                  isDisabled={isRefreshing}
                  onPress={refreshSchedules}
                  aria-label="Refresh schedules"
                >
                  <RefreshCw
                    size={16}
                    aria-hidden="true"
                    className={cn(isRefreshing && 'animate-spin')}
                  />
                  <span className="ml-1.5 hidden sm:inline">
                    {isRefreshing ? 'Refreshing…' : 'Refresh schedules'}
                  </span>
                </Button>
              </div>
              <p className="mt-3 text-xs font-semibold text-muted">
                {openSlots.length} open slot{openSlots.length === 1 ? '' : 's'}
              </p>
            </header>

            <div className="flex-1 space-y-2 p-4 sm:p-5">
              {scheduleError ? (
                <div className="mb-3 rounded-md border border-danger/20 bg-red-50 p-3" role="alert">
                  <p className="text-sm font-semibold text-danger">{scheduleError}</p>
                  <Button
                    variant="secondary"
                    size="compact"
                    className="mt-2"
                    onPress={() => void fetchMonth(focusedDate)}
                  >
                    Try again
                  </Button>
                </div>
              ) : null}
              {isMonthLoading ? (
                <p className="py-8 text-center text-sm text-muted" role="status">
                  Loading availability…
                </p>
              ) : slotsForDate.length === 0 ? (
                <div className="py-8 text-center">
                  <CalendarCheck size={28} className="mx-auto text-muted" aria-hidden="true" />
                  <p className="mt-2 text-sm font-semibold text-primary">
                    No time slots for this date.
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Choose another date or refresh the schedules.
                  </p>
                </div>
              ) : (
                slotsForDate.map((slot) => {
                  const open = isOpenSlot(slot)
                  const active = selectedId === slot.id
                  return (
                    <button
                      type="button"
                      key={slot.id}
                      disabled={!open}
                      aria-pressed={active}
                      aria-label={`${formatTimeRange(slot.start_time, slot.end_time)} ${slot.slot_status}`}
                      onClick={() => chooseSlot(slot)}
                      className={cn(
                        'flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition-colors',
                        'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus',
                        open
                          ? 'border-emerald-200 bg-emerald-50 text-success hover:bg-emerald-100'
                          : 'cursor-not-allowed border-border bg-background text-muted',
                        active && 'border-accent ring-3 ring-accent/30'
                      )}
                    >
                      <span className="text-sm font-semibold">
                        {formatTimeRange(slot.start_time, slot.end_time)}
                      </span>
                      <span className="flex items-center gap-2">
                        <StatusBadge status={slot.slot_status} />
                        {open ? (
                          <span
                            aria-hidden="true"
                            className={cn(
                              'grid size-5 place-items-center rounded-full border-2',
                              active ? 'border-accent' : 'border-emerald-300'
                            )}
                          >
                            {active ? <span className="size-2 rounded-full bg-accent" /> : null}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  )
                })
              )}
            </div>

            <div className="border-t border-border p-4 sm:p-5">
              <Button
                fullWidth
                isDisabled={!selectedOpen}
                onPress={() => setStep('details')}
                aria-label="Continue"
              >
                Continue to Details
                <ArrowRight size={16} aria-hidden="true" className="ml-2" />
              </Button>
            </div>
          </section>
        </div>
      ) : null}

      {step === 'details' ? (
        <>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-subtle text-accent">
                  <CalendarCheck size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-primary">Consultation Information</h2>
                  <p className="mt-0.5 text-sm text-muted">Your selected schedule.</p>
                </div>
              </div>
              <dl className="mt-5 divide-y divide-border border-y border-border text-sm">
                <div className="grid gap-1 py-3 sm:grid-cols-[7rem_1fr]">
                  <dt className="flex items-center gap-2 font-semibold">
                    <UserRound size={15} aria-hidden="true" /> Faculty
                  </dt>
                  <dd>{selected?.faculty_name ?? facultyName}</dd>
                </div>
                <div className="grid gap-1 py-3 sm:grid-cols-[7rem_1fr]">
                  <dt className="flex items-center gap-2 font-semibold">
                    <CalendarCheck size={15} aria-hidden="true" /> Date
                  </dt>
                  <dd>{formatDate(selectedDate)}</dd>
                </div>
                <div className="grid gap-1 py-3 sm:grid-cols-[7rem_1fr]">
                  <dt className="flex items-center gap-2 font-semibold">
                    <Clock size={15} aria-hidden="true" /> Time
                  </dt>
                  <dd>
                    {selected
                      ? formatTimeRange(selected.start_time, selected.end_time)
                      : 'Not selected'}
                  </dd>
                </div>
                <div className="grid gap-1 py-3 sm:grid-cols-[7rem_1fr]">
                  <dt className="flex items-center gap-2 font-semibold">
                    <MapPin size={15} aria-hidden="true" /> Mode
                  </dt>
                  <dd>{selected ? modeLabel(selected) : 'Not selected'}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-subtle text-accent">
                  <FileText size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-primary">Additional Details</h2>
                  <p className="mt-0.5 text-sm text-muted">Help the faculty prepare.</p>
                </div>
              </div>
              <Select
                label="Category"
                options={Object.entries(categories).map(([value, label]) => ({ id: value, label }))}
                value={category}
                placeholder="Select a concern"
                onChange={(value) => setCategory(value as ConsultationCategory | '')}
                isRequired
                className="mt-5"
              />
              <label className={cn(field, 'mt-4')} htmlFor="booking-notes">
                Short description (optional)
                <textarea
                  id="booking-notes"
                  className={cn(control, 'min-h-32 resize-y')}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  maxLength={2000}
                  aria-describedby="booking-notes-hint"
                />
                <span id="booking-notes-hint" className="text-right text-xs font-normal text-muted">
                  {notes.length}/2000
                </span>
              </label>
            </section>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              className="flex-1 sm:flex-none"
              onPress={() => setStep('schedule')}
            >
              <ArrowLeft size={16} aria-hidden="true" className="mr-2" />
              Back
            </Button>
            <Button
              className="flex-1 sm:flex-none"
              isDisabled={!category.trim() || !selectedOpen}
              onPress={() => setStep('review')}
              aria-label="Review request"
            >
              Continue to Review
              <ArrowRight size={16} aria-hidden="true" className="ml-2" />
            </Button>
          </div>
        </>
      ) : null}

      {step === 'review' && selected ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-subtle text-accent">
                  <CalendarCheck size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-primary">Schedule Details</h2>
                  <p className="mt-0.5 text-sm text-muted">Time you are requesting.</p>
                </div>
              </div>
              <dl className="mt-5 divide-y divide-border border-y border-border text-sm">
                <div className="grid gap-1 py-3 sm:grid-cols-[6rem_1fr]">
                  <dt className="font-semibold">Faculty</dt>
                  <dd>{selected.faculty_name ?? facultyName}</dd>
                </div>
                <div className="grid gap-1 py-3 sm:grid-cols-[6rem_1fr]">
                  <dt className="font-semibold">Date</dt>
                  <dd>{formatDate(selected.slot_date)}</dd>
                </div>
                <div className="grid gap-1 py-3 sm:grid-cols-[6rem_1fr]">
                  <dt className="font-semibold">Time</dt>
                  <dd>{formatTimeRange(selected.start_time, selected.end_time)}</dd>
                </div>
                <div className="grid gap-1 py-3 sm:grid-cols-[6rem_1fr]">
                  <dt className="font-semibold">Mode</dt>
                  <dd>{modeLabel(selected)}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-subtle text-accent">
                  <FileText size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-primary">Request Details</h2>
                  <p className="mt-0.5 text-sm text-muted">What you would like to discuss.</p>
                </div>
              </div>
              <dl className="mt-5 divide-y divide-border border-y border-border text-sm">
                <div className="grid gap-1 py-3 sm:grid-cols-[6rem_1fr]">
                  <dt className="font-semibold">Category</dt>
                  <dd>{categoryLabel(category)}</dd>
                </div>
                <div className="grid gap-1 py-3 sm:grid-cols-[6rem_1fr]">
                  <dt className="font-semibold">Description</dt>
                  <dd className="whitespace-pre-wrap">{notes.trim() || 'None provided'}</dd>
                </div>
              </dl>
            </section>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg border border-accent/20 bg-subtle p-4 text-sm text-muted">
            <Info size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
            <p>
              Please review your request before submitting. You can go back to make changes if
              needed.
            </p>
          </div>

          <form action={formAction} className="mt-5">
            <input type="hidden" name="slotId" value={selected.id} />
            <input type="hidden" name="category" value={category} />
            <input type="hidden" name="notes" value={notes} />
            {state.error ? (
              <p
                className="mb-3 rounded-md border border-danger/20 bg-red-50 p-3 text-sm font-semibold text-danger"
                role="alert"
              >
                {state.error}
              </p>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 sm:flex-none"
                onPress={() => setStep('details')}
              >
                <ArrowLeft size={16} aria-hidden="true" className="mr-2" />
                Back
              </Button>
              <SubmitButton className="w-auto flex-1 sm:w-auto sm:flex-none">
                Confirm Booking Request
              </SubmitButton>
            </div>
          </form>
        </>
      ) : null}
    </section>
  )
}
