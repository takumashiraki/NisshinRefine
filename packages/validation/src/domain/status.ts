import { z } from 'zod'

export const statusDomainSchema = z.object({
  userId: z.string().min(1),
  strength: z.number().int().min(0),
  intelligence: z.number().int().min(0),
  agility: z.number().int().min(0),
  health: z.number().int().min(0),
  level: z.number().int().min(1),
  rank: z.enum(['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']),
})

export type StatusDomainInput = z.input<typeof statusDomainSchema>
export type StatusDomainOutput = z.output<typeof statusDomainSchema>
