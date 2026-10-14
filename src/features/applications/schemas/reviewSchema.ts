import { z } from 'zod'

const decisionSchema = z.enum(['APPROVED', 'REJECTED'])

export const reviewDecisionSchema = z.object({
  userId: z.uuid(),
  decision: decisionSchema,
})

export const bulkReviewSchema = z.object({
  userIds: z.array(z.uuid()).min(1).max(50),
  decision: decisionSchema,
})

export type ReviewDecisionInput = z.infer<typeof reviewDecisionSchema>
