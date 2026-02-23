import { z } from '@hono/zod-openapi'
import {
  createStatusLogsRequestApiSchema,
  createStatusLogsResponseApiSchema,
  statusMetricApiSchema,
  statusSummaryApiSchema,
} from '../api/status'
import { metricCodeSchema, mappingTypeSchema } from '../drizzle/zod'

export const metricCodeOpenApiSchema = z.enum(metricCodeSchema.options).openapi('MetricCode')

export const mappingTypeOpenApiSchema = z.enum(mappingTypeSchema.options).openapi('MappingType')

export const statusMetricOpenApiSchema = z
  .object(statusMetricApiSchema.shape)
  .extend({
    id: z.number().openapi({ example: 1 }),
    metricCode: metricCodeOpenApiSchema,
    displayName: z.string().openapi({ example: 'Strength' }),
    mappingType: mappingTypeOpenApiSchema,
    unit: z.string().optional().openapi({ example: 'ratio' }),
    sortOrder: z.number().openapi({ example: 10 }),
    isActive: z.boolean().openapi({ example: true }),
    updatedAt: z.string().openapi({ example: '2026-02-23T09:00:00.000Z' }),
  })
  .openapi('StatusMetric')

export const statusMetricsListResponseOpenApiSchema = z
  .object({
    metrics: z.array(statusMetricOpenApiSchema),
  })
  .openapi('StatusMetricsListResponse')

export const statusSummaryItemOpenApiSchema = z
  .object({
    metricCode: metricCodeOpenApiSchema,
    displayName: z.string().openapi({ example: 'Health' }),
    score: z.number().int().openapi({ example: 8 }),
  })
  .openapi('StatusSummaryItem')

export const statusSummaryResponseOpenApiSchema = z
  .object(statusSummaryApiSchema.extend({ statuses: z.array(statusSummaryItemOpenApiSchema) }).shape)
  .extend({
    date: z.string().openapi({ example: '2026-02-23' }),
  })
  .openapi('StatusSummaryResponse')

export const createStatusLogsRequestOpenApiSchema = z
  .object(createStatusLogsRequestApiSchema.shape)
  .extend({
    statusId: z.string().uuid().openapi({ example: '22222222-2222-4222-8222-222222222222' }),
    recordDate: z.string().openapi({ example: '2026-02-23' }),
    items: z.array(
      z.object({
        metricCode: metricCodeOpenApiSchema,
        rawValue: z.number().openapi({ example: 1.8 }),
        note: z.string().optional().openapi({ example: 'squat/deadlift/benchの平均' }),
      }),
    ),
  })
  .openapi('CreateStatusLogsRequest')

export const createStatusLogsResponseOpenApiSchema = z
  .object(createStatusLogsResponseApiSchema.shape)
  .extend({
    recordDate: z.string().openapi({ example: '2026-02-23' }),
    items: z.array(
      z.object({
        metricCode: metricCodeOpenApiSchema,
        rawValue: z.number().openapi({ example: 1.8 }),
        score: z.number().int().openapi({ example: 7 }),
      }),
    ),
  })
  .openapi('CreateStatusLogsResponse')

export const statusParamsOpenApiSchema = z
  .object({
    statusId: z.string().uuid().openapi({ example: '22222222-2222-4222-8222-222222222222' }),
  })
  .openapi('StatusParams')

export const statusSummaryQueryOpenApiSchema = z
  .object({
    date: z.string().optional().openapi({ example: '2026-02-23' }),
  })
  .openapi('StatusSummaryQuery')

export const errorResponseOpenApiSchema = z
  .object({
    error_code: z.string().openapi({ example: 'Invalid Request' }),
    errors: z
      .array(
        z.object({
          message: z.string().openapi({ example: 'invalid metricCode' }),
          field: z.string().openapi({ example: 'items[0].metricCode' }),
        }),
      )
      .optional(),
  })
  .openapi('ErrorResponse')
