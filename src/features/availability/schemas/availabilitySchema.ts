import { z } from 'zod'

export const availabilitySchema = z
  .object({
    date: z.iso.date(),
    startTime: z.iso.time(),
    endTime: z.iso.time(),
    mode: z.enum(['IN_PERSON', 'ONLINE']),
    location: z.string().trim().max(160).optional(),
    meetingLink: z.union([z.url(), z.literal('')]).optional(),
  })
  .superRefine((value, context) => {
    if (value.endTime <= value.startTime)
      context.addIssue({ code: 'custom', path: ['endTime'], message: 'End time must be later.' })
    if (value.mode === 'IN_PERSON' && !value.location)
      context.addIssue({ code: 'custom', path: ['location'], message: 'Location is required.' })
  })
