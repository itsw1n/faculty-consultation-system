import { z } from 'zod'

export const LIST_PAGE_SIZE = 20

export const cursorSchema = z
  .object({
    createdAt: z.iso.datetime({ offset: true }),
    id: z.uuid(),
  })
  .nullable()
