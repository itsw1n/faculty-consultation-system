import { z } from 'zod'

const meetingLink = z
  .url()
  .refine((value) => /^https?:\/\//i.test(value), { message: 'Use an http or https link.' })

export const availabilitySchema = z
  .object({
    date: z.iso.date(),
    startTime: z.iso.time(),
    endTime: z.iso.time(),
    mode: z.enum(['IN_PERSON', 'ONLINE']),
    location: z.string().trim().max(160).optional(),
    meetingLink: z.union([meetingLink, z.literal('')]).optional(),
  })
  .superRefine((value, context) => {
    if (value.endTime <= value.startTime)
      context.addIssue({ code: 'custom', path: ['endTime'], message: 'End time must be later.' })
    if (value.mode === 'IN_PERSON' && !value.location)
      context.addIssue({ code: 'custom', path: ['location'], message: 'Location is required.' })
  })
