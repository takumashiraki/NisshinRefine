import { z } from 'zod'

export const metricCodeSchema = z.enum(['strength', 'routine', 'health'])

export const mappingTypeSchema = z.enum(['formula_fixed', 'manual_1_10'])

export const statusMetricDomainSchema = z.object({
  id: z.number().int().positive(),
  userId: z.string().min(1),
  metricCode: metricCodeSchema,
  displayName: z.string().min(1),
  mappingType: mappingTypeSchema,
  unit: z.string().min(1).optional(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
  updatedAt: z.string().datetime(),
})

export const statusLogItemInputDomainSchema = z.object({
  metricCode: metricCodeSchema,
  rawValue: z.number().finite(),
  note: z.string().max(500).optional(),
})

export const createStatusLogsDomainSchema = z.object({
  recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  items: z.array(statusLogItemInputDomainSchema).min(1),
})

export const statusSummaryItemDomainSchema = z.object({
  metricCode: metricCodeSchema,
  displayName: z.string().min(1),
  score: z.number().int().min(1).max(10),
})

export const statusSummaryDomainSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  statuses: z.array(statusSummaryItemDomainSchema),
})

export type StatusMetricDomainInput = z.input<typeof statusMetricDomainSchema>
export type StatusMetricDomainOutput = z.output<typeof statusMetricDomainSchema>
export type CreateStatusLogsDomainInput = z.input<typeof createStatusLogsDomainSchema>
export type CreateStatusLogsDomainOutput = z.output<typeof createStatusLogsDomainSchema>
export type StatusSummaryDomainInput = z.input<typeof statusSummaryDomainSchema>
export type StatusSummaryDomainOutput = z.output<typeof statusSummaryDomainSchema>
