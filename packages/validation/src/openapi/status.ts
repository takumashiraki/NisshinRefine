import { z } from '@hono/zod-openapi'

export const statusOpenApiSchema = z
  .object({
    userId: z.string().openapi({ example: 'user_001' }),
    strength: z.number().openapi({ example: 10 }),
    intelligence: z.number().openapi({ example: 9 }),
    agility: z.number().openapi({ example: 8 }),
    health: z.number().openapi({ example: 7 }),
    level: z.number().openapi({ example: 3 }),
    rank: z.string().openapi({ example: 'E' }),
  })
  .openapi('Status')
