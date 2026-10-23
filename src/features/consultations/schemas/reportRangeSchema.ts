import { z } from 'zod'

export const MAX_REPORT_DAYS = 366

export function reportDayCount(from: string, to: string): number {
  return (
    Math.floor((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000) + 1
  )
}

export const reportRangeSchema = z
  .object({ from: z.iso.date(), to: z.iso.date() })
  .refine((range) => range.from <= range.to, {
    message: 'The start date must be on or before the end date.',
    path: ['to'],
  })
  .refine((range) => reportDayCount(range.from, range.to) <= MAX_REPORT_DAYS, {
    message: 'Choose a range of up to 366 days.',
    path: ['to'],
  })
