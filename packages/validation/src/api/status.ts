import { z } from 'zod'
import { metricCodeSchema } from '../drizzle/zod'
import { createStatusLogsDomainSchema, statusMetricDomainSchema } from '../domain/status'

export const statusMetricApiSchema = statusMetricDomainSchema

export const statusSummaryItemApiSchema = z.object({
  metricCode: metricCodeSchema,
  displayName: statusMetricDomainSchema.shape.displayName,
  score: z.number().int().min(1).max(10),
})

export const statusSummaryApiSchema = z.object({
  date: z.string(),
  statuses: z.array(statusSummaryItemApiSchema),
})

export const createStatusLogsRequestApiSchema = createStatusLogsDomainSchema

export const createStatusLogsResponseApiSchema = z.object({
  recordDate: createStatusLogsDomainSchema.shape.recordDate,
  items: z.array(
    z.object({
      metricCode: metricCodeSchema,
      rawValue: z.number(),
      score: z.number().int().min(1).max(10),
    }),
  ),
})

export type StatusMetricApiInput = z.input<typeof statusMetricApiSchema>
export type StatusMetricApiOutput = z.output<typeof statusMetricApiSchema>
export type StatusSummaryApiInput = z.input<typeof statusSummaryApiSchema>
export type StatusSummaryApiOutput = z.output<typeof statusSummaryApiSchema>
export type CreateStatusLogsRequestApiInput = z.input<typeof createStatusLogsRequestApiSchema>
export type CreateStatusLogsRequestApiOutput = z.output<typeof createStatusLogsRequestApiSchema>
