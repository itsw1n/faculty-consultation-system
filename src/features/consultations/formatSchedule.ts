const dayFormatter = new Intl.DateTimeFormat('en-PH', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'Asia/Manila',
})
const timeFormatter = new Intl.DateTimeFormat('en-PH', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'Asia/Manila',
})

export function formatConsultationDay(date: string) {
  return dayFormatter.format(new Date(`${date}T00:00:00+08:00`))
}

export function formatConsultationTime(start: string, end: string) {
  const startDate = new Date(`1970-01-01T${start}+08:00`)
  const endDate = new Date(`1970-01-01T${end}+08:00`)
  return `${timeFormatter.format(startDate)}–${timeFormatter.format(endDate)}`
}
