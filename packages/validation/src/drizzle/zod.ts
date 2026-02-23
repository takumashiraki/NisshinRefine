import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { statusLogTable, statusMetricTable, userTable } from './schema'

export const metricCodeSchema = z.enum(['strength', 'routine', 'health'])
export const mappingTypeSchema = z.enum(['formula_fixed', 'manual_1_10'])

export const userSelectSchema = createSelectSchema(userTable, {
  userId: z.string().uuid(),
})

export const userInsertSchema = createInsertSchema(userTable, {
  userId: z.string().uuid(),
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
