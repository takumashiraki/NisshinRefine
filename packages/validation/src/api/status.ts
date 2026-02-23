import { z } from 'zod'
import { mappingTypeSchema, metricCodeSchema } from '../domain/status'

export const statusMetricApiSchema = z.object({
  id: z.number().int(),
  metricCode: metricCodeSchema,
  displayName: z.string(),
  mappingType: mappingTypeSchema,
  unit: z.string().optional(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  updatedAt: z.string(),
})

export const statusSummaryItemApiSchema = z.object({
  metricCode: metricCodeSchema,
  displayName: z.string(),
  score: z.number().int().min(1).max(10),
})

export const statusSummaryApiSchema = z.object({
  date: z.string(),
  statuses: z.array(statusSummaryItemApiSchema),
})

export const createStatusLogsRequestApiSchema = z.object({
  recordDate: z.string(),
  items: z.array(
    z.object({
      metricCode: metricCodeSchema,
      rawValue: z.number(),
      note: z.string().optional(),
    }),
  ),
})

export const createStatusLogsResponseApiSchema = z.object({
  recordDate: z.string(),
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
