import { z } from 'zod'

export const consultationIdSchema = z.uuid()

export const approvalDecisionSchema = z.enum(['true', 'false'])

export const outcomeSchema = z.string().trim().max(2000)
