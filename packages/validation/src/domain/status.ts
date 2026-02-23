import { z } from 'zod'
import {
  mappingTypeSchema,
  metricCodeSchema,
  statusLogInsertSchema,
  statusMetricSelectSchema,
} from '../drizzle/zod'

export { mappingTypeSchema, metricCodeSchema } from '../drizzle/zod'

export const statusMetricDomainSchema = statusMetricSelectSchema
  .pick({
    id: true,
    metricCode: true,
    displayName: true,
    mappingType: true,
    unit: true,
    sortOrder: true,
    isActive: true,
    updatedAt: true,
  })
  .extend({
    isActive: z.boolean(),
  })

export const statusLogItemInputDomainSchema = statusLogInsertSchema.pick({
  rawValue: true,
  note: true,
}).extend({
  metricCode: metricCodeSchema,
})

export const createStatusLogsDomainSchema = z.object({
  statusId: statusLogInsertSchema.shape.statusId,
  recordDate: statusLogInsertSchema.shape.recordDate.regex(/^\d{4}-\d{2}-\d{2}$/),
  items: z.array(statusLogItemInputDomainSchema).min(1),
})

export const statusSummaryItemDomainSchema = z.object({
  metricCode: metricCodeSchema,
  displayName: statusMetricSelectSchema.shape.displayName,
  score: statusLogInsertSchema.shape.score.int().min(1).max(10),
})

export const statusSummaryDomainSchema = z.object({
  date: statusLogInsertSchema.shape.recordDate.regex(/^\d{4}-\d{2}-\d{2}$/),
  statuses: z.array(statusSummaryItemDomainSchema),
})

export type StatusMetricDomainInput = z.input<typeof statusMetricDomainSchema>
export type StatusMetricDomainOutput = z.output<typeof statusMetricDomainSchema>
export type CreateStatusLogsDomainInput = z.input<typeof createStatusLogsDomainSchema>
export type CreateStatusLogsDomainOutput = z.output<typeof createStatusLogsDomainSchema>
export type StatusSummaryDomainInput = z.input<typeof statusSummaryDomainSchema>
export type StatusSummaryDomainOutput = z.output<typeof statusSummaryDomainSchema>
