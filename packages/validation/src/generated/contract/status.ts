// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.

import { z } from 'zod'
import { createSchemaFactory } from 'drizzle-zod'
import { statusLogsTable, statusMetricsTable } from '../db/status'

const { createInsertSchema, createSelectSchema } = createSchemaFactory()

const statusMetricSelectBaseSchema = createSelectSchema(statusMetricsTable)
const statusLogInsertBaseSchema = createInsertSchema(statusLogsTable)

export const statusMetricCodeContractSchema = z.enum(['strength', 'routine', 'health'])
export const statusMappingTypeContractSchema = z.enum(['formula_fixed', 'manual_1_10'])

export const statusParamsContractSchema = z.object({
  statusId: statusMetricSelectBaseSchema.shape.statusId.min(1),
})

export const statusSummaryQueryContractSchema = z.object({
  date: statusLogInsertBaseSchema.shape.recordDate.regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export const statusMetricResponseContractSchema = z.object({
  id: statusMetricSelectBaseSchema.shape.id.int().positive(),
  metricCode: statusMetricCodeContractSchema,
  displayName: statusMetricSelectBaseSchema.shape.displayName.min(1),
  mappingType: statusMappingTypeContractSchema,
  unit: statusMetricSelectBaseSchema.shape.unit.optional(),
  sortOrder: statusMetricSelectBaseSchema.shape.sortOrder.int().nonnegative(),
  isActive: statusMetricSelectBaseSchema.shape.isActive,
  updatedAt: statusMetricSelectBaseSchema.shape.updatedAt,
})

export const statusMetricsListResponseContractSchema = z.object({
  metrics: z.array(statusMetricResponseContractSchema),
})

export const statusSummaryItemResponseContractSchema = z.object({
  metricCode: statusMetricCodeContractSchema,
  displayName: z.string().min(1),
  score: z.number().int().min(1).max(10),
})

export const statusSummaryResponseContractSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  statuses: z.array(statusSummaryItemResponseContractSchema),
})

export const statusLogCreateItemInputContractSchema = z.object({
  metricCode: statusMetricCodeContractSchema,
  rawValue: statusLogInsertBaseSchema.shape.rawValue,
  note: statusLogInsertBaseSchema.shape.note.optional(),
})

export const statusLogsCreateInputContractSchema = z.object({
  statusId: statusMetricSelectBaseSchema.shape.statusId.min(1),
  recordDate: statusLogInsertBaseSchema.shape.recordDate.regex(/^\d{4}-\d{2}-\d{2}$/),
  items: z.array(statusLogCreateItemInputContractSchema).min(1),
})

export const statusLogCreateItemResponseContractSchema = z.object({
  metricCode: statusMetricCodeContractSchema,
  rawValue: z.number(),
  score: z.number().int().min(1).max(10),
})

export const statusLogsCreateResponseContractSchema = z.object({
  recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  items: z.array(statusLogCreateItemResponseContractSchema),
})

export const statusErrorResponseContractSchema = z.object({
  error_code: z.string(),
  errors: z
    .array(
      z.object({
        message: z.string(),
        field: z.string(),
      }),
    )
    .optional(),
})
