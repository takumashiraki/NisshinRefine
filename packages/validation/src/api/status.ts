import { z } from 'zod'

export const statusApiSchema = z.object({
  userId: z.string(),
  strength: z.number(),
  intelligence: z.number(),
  agility: z.number(),
  health: z.number(),
  level: z.number(),
  rank: z.string(),
})

export type StatusApiInput = z.input<typeof statusApiSchema>
export type StatusApiOutput = z.output<typeof statusApiSchema>
