'use client'

import { useMemo } from 'react'
import { Calendar, CalendarCell, CalendarGrid, CalendarHeading } from 'react-aria-components'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { parseDate, today, type CalendarDate } from '@internationalized/date'
import { Button } from '@/components/common/button/Button'
import { cn } from '@/lib/cn'
import type { SlotResult } from '../types'

type DateAvailability = {
  open: number
  reserved: number
  booked: number
  closed: number
}

type BookingCalendarProps = {
  slots: SlotResult[]
  selectedDate: string
  focusedDate: CalendarDate
  onSelectDate: (date: string) => void
  onFocusDateChange: (date: CalendarDate) => void
  onToday: () => void
}

const TODAY = today('Asia/Manila')
const legend = [
  { label: 'Open', dot: 'bg-success' },
  { label: 'Reserved', dot: 'bg-warning' },
  { label: 'Booked', dot: 'bg-accent' },
  { label: 'Closed', dot: 'bg-muted/40' },
]

function markerClass(availability: DateAvailability | undefined) {
  if (!availability) return null
  if (availability.open > 0) return 'bg-success'
  if (availability.reserved > 0) return 'bg-warning'
  if (availability.booked > 0) return 'bg-accent'
  if (availability.closed > 0) return 'bg-muted/40'
  return null
}

export function BookingCalendar({
  slots,
  selectedDate,
  focusedDate,
  onSelectDate,
  onFocusDateChange,
  onToday,
}: BookingCalendarProps) {
  const availability = useMemo(() => {
    const map = new Map<string, DateAvailability>()
    for (const slot of slots) {
      const current = map.get(slot.slot_date) ?? {
        open: 0,
        reserved: 0,
        booked: 0,
        closed: 0,
      }
      if (slot.slot_status === 'OPEN') current.open += 1
      if (slot.slot_status === 'RESERVED') current.reserved += 1
      if (slot.slot_status === 'BOOKED') current.booked += 1
      if (slot.slot_status === 'CLOSED') current.closed += 1
      map.set(slot.slot_date, current)
    }
    return map
  }, [slots])

  return (
    <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-subtle text-accent">
            <CalendarDays size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-primary">Select a Date</h2>
            <p className="mt-0.5 text-sm text-muted">Choose a date with available time slots.</p>
          </div>
        </div>
        <Button variant="ghost" size="compact" className="min-w-0 px-2" onPress={onToday}>
          Today
        </Button>
      </div>

      <Calendar
        aria-label="Consultation date"
        value={selectedDate ? parseDate(selectedDate) : null}
        onChange={(date) => date && onSelectDate(date.toString())}
        focusedValue={focusedDate}
        onFocusChange={onFocusDateChange}
        minValue={TODAY}
        firstDayOfWeek="sun"
        className="mt-5"
      >
        <div className="flex items-center justify-between gap-2">
          <Button
            slot="previous"
            variant="secondary"
            aria-label="Previous month"
            className="size-9 min-h-9 min-w-0 px-0"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </Button>
          <CalendarHeading className="text-sm font-semibold text-primary sm:text-base" />
          <Button
            slot="next"
            variant="secondary"
            aria-label="Next month"
            className="size-9 min-h-9 min-w-0 px-0"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </Button>
        </div>

        <CalendarGrid
          weekdayStyle="short"
          className="mt-3 w-full border-separate border-spacing-1 [&_td]:p-0 [&_th]:p-0"
        >
          {(date) => {
            const dayAvailability = availability.get(date.toString())
            const marker = markerClass(dayAvailability)
            return (
              <CalendarCell
                date={date}
                className={({ isDisabled, isFocusVisible, isOutsideMonth, isSelected, isToday }) =>
                  cn(
                    'relative flex size-10 cursor-pointer items-center justify-center rounded-full text-sm font-medium text-foreground outline-none transition-colors',
                    isOutsideMonth && 'text-muted/45',
                    isDisabled && 'cursor-not-allowed text-muted/35',
                    !isSelected && !isDisabled && 'hover:bg-subtle',
                    isToday && !isSelected && 'ring-1 ring-accent',
                    isSelected && 'bg-primary font-semibold text-white',
                    isFocusVisible && 'outline-3 outline-offset-2 outline-focus'
                  )
                }
              >
                {({ isSelected }) => (
                  <>
                    <span>{date.day}</span>
                    {marker ? (
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute bottom-1 size-1 rounded-full',
                          isSelected ? 'bg-white' : marker
                        )}
                      />
                    ) : null}
                    {dayAvailability?.open ? (
                      <span className="sr-only">, {dayAvailability.open} open slots</span>
                    ) : null}
                  </>
                )}
              </CalendarCell>
            )
          }}
        </CalendarGrid>
      </Calendar>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4 text-xs font-semibold">
        {legend.map((item) => (
          <span className="inline-flex items-center gap-1.5 text-muted" key={item.label}>
            <span aria-hidden="true" className={cn('size-1.5 rounded-full', item.dot)} />
            {item.label}
          </span>
        ))}
      </div>
    </section>
  )
}
