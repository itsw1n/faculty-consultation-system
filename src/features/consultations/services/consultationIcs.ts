export type ConsultationEvent = {
  id: string
  title: string
  purpose: string
  slot_date: string
  start_time: string
  end_time: string
  location: string
}

// Slots are stored in Asia/Manila local time, which has no daylight saving (UTC+8).
const MANILA_OFFSET_HOURS = 8

function utcStamp(date: Date) {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
}

function slotStamp(slotDate: string, time: string) {
  const [year, month, day] = slotDate.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  return utcStamp(new Date(Date.UTC(year, month - 1, day, hour - MANILA_OFFSET_HOURS, minute)))
}

function text(value: string) {
  return value.replace(/[\\;,]/g, (match) => `\\${match}`).replace(/\r?\n/g, '\\n')
}

function fold(line: string) {
  const parts = []
  for (let index = 0; index < line.length; index += 74) parts.push(line.slice(index, index + 74))
  return parts.join('\r\n ')
}

export function consultationIcs(event: ConsultationEvent, now = new Date()) {
  return (
    [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Assumption College of Davao//Faculty Consultation//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${event.id}@faculty-consultation-system`,
      `DTSTAMP:${utcStamp(now)}`,
      `DTSTART:${slotStamp(event.slot_date, event.start_time)}`,
      `DTEND:${slotStamp(event.slot_date, event.end_time)}`,
      `SUMMARY:${text(event.title)}`,
      `DESCRIPTION:${text(`Purpose: ${event.purpose}`)}`,
      `LOCATION:${text(event.location)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .map(fold)
      .join('\r\n') + '\r\n'
  )
}
