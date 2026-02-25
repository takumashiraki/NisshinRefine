import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { statusLogTable, statusMetricTable, userTable } from './schema'

export const metricCodeSchema = z.enum(['strength', 'routine', 'health'])
export const mappingTypeSchema = z.enum(['formula_fixed', 'manual_1_10'])

export const userSelectSchema = createSelectSchema(userTable, {
  id: z.number().int(),
  email: z.string().email(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const userInsertSchema = createInsertSchema(userTable, {
  email: z.string().email(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const statusMetricSelectSchema = createSelectSchema(statusMetricTable, {
  statusId: z.string().uuid(),
  metricCode: metricCodeSchema,
  mappingType: mappingTypeSchema,
})

export const statusLogSelectSchema = createSelectSchema(statusLogTable, {
  statusId: z.string().uuid(),
})

export const statusLogInsertSchema = createInsertSchema(statusLogTable, {
  statusId: z.string().uuid(),
})
