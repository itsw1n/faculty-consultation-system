export const MANILA_TIME_ZONE = 'Asia/Manila'

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: MANILA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: MANILA_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

export function manilaDateKey(date = new Date()): string {
  return dateFormatter.format(date)
}

export function manilaTimeKey(date = new Date()): string {
  return timeFormatter.format(date)
}

export function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) throw new Error('Invalid date')
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function normalizeTime(value: string): string {
  const [hours = '00', minutes = '00', seconds = '00'] = value.split(':')
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
}

export function isPastSlot(date: string, startTime: string, now = new Date()): boolean {
  const today = manilaDateKey(now)
  if (date !== today) return date < today
  return normalizeTime(startTime) <= manilaTimeKey(now)
}
