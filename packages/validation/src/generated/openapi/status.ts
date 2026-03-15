// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.

import { z } from '@hono/zod-openapi'
import {
  statusErrorResponseContractSchema,
  statusLogsCreateInputContractSchema,
  statusLogsCreateResponseContractSchema,
  statusMappingTypeContractSchema,
  statusMetricCodeContractSchema,
  statusMetricResponseContractSchema,
  statusMetricsListResponseContractSchema,
  statusParamsContractSchema,
  statusSummaryItemResponseContractSchema,
  statusSummaryQueryContractSchema,
  statusSummaryResponseContractSchema,
} from '../contract/status'

const withContract = <TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  _contractSchema: unknown,
): TSchema => schema

export const metricCodeOpenApiSchema = withContract(
  z.enum(['strength', 'routine', 'health']),
  statusMetricCodeContractSchema,
).openapi('MetricCode')

export const mappingTypeOpenApiSchema = withContract(
  z.enum(['formula_fixed', 'manual_1_10']),
  statusMappingTypeContractSchema,
).openapi('MappingType')

export const statusMetricOpenApiSchema = withContract(
  z.object({
    id: z.number().int().positive().openapi({ example: 1 }),
    metricCode: metricCodeOpenApiSchema,
    displayName: z.string().min(1).openapi({ example: 'Strength' }),
    mappingType: mappingTypeOpenApiSchema,
    unit: z.string().optional().openapi({ example: 'ratio' }),
    sortOrder: z.number().int().nonnegative().openapi({ example: 10 }),
    isActive: z.boolean().openapi({ example: true }),
    updatedAt: z.string().openapi({
      example: '2026-02-23T09:00:00.000Z',
    }),
  }),
  statusMetricResponseContractSchema,
).openapi('StatusMetric')

export const statusMetricsListResponseOpenApiSchema = withContract(
  z.object({
    metrics: z.array(statusMetricOpenApiSchema),
  }),
  statusMetricsListResponseContractSchema,
).openapi('StatusMetricsListResponse')

export const statusSummaryItemOpenApiSchema = withContract(
  z.object({
    metricCode: metricCodeOpenApiSchema,
    displayName: z.string().min(1).openapi({ example: 'Health' }),
    score: z.number().int().min(1).max(10).openapi({ example: 7 }),
  }),
  statusSummaryItemResponseContractSchema,
).openapi('StatusSummaryItem')

export const statusSummaryResponseOpenApiSchema = withContract(
  z.object({
    date: z.string().openapi({ example: '2026-02-23' }),
    statuses: z.array(statusSummaryItemOpenApiSchema),
  }),
  statusSummaryResponseContractSchema,
).openapi('StatusSummaryResponse')

export const createStatusLogsRequestOpenApiSchema = withContract(
  z.object({
    statusId: z.string().min(1).openapi({ example: 'status_001' }),
    recordDate: z.string().openapi({ example: '2026-02-23' }),
    items: z
      .array(
        z.object({
          metricCode: metricCodeOpenApiSchema,
          rawValue: z.number().openapi({ example: 1.8 }),
          note: z.string().optional().openapi({ example: 'squat/deadlift/benchの平均' }),
        }),
      )
      .min(1),
  }),
  statusLogsCreateInputContractSchema,
).openapi('CreateStatusLogsRequest')

export const createStatusLogsResponseOpenApiSchema = withContract(
  z.object({
    recordDate: z.string().openapi({ example: '2026-02-23' }),
    items: z.array(
      z.object({
        metricCode: metricCodeOpenApiSchema,
        rawValue: z.number().openapi({
          example: 1.8,
        }),
        score: z.number().int().min(1).max(10).openapi({ example: 7 }),
      }),
    ),
  }),
  statusLogsCreateResponseContractSchema,
).openapi('CreateStatusLogsResponse')

export const statusParamsOpenApiSchema = withContract(
  z.object({
    statusId: z.string().min(1).openapi({ example: 'status_001' }),
  }),
  statusParamsContractSchema,
).openapi('StatusParams')

export const statusSummaryQueryOpenApiSchema = withContract(
  z.object({
    date: z.string().optional().openapi({ example: '2026-02-23' }),
  }),
  statusSummaryQueryContractSchema,
).openapi('StatusSummaryQuery')

export const errorResponseOpenApiSchema = withContract(
  z.object({
    error_code: z.string().openapi({ example: 'Invalid Request' }),
    errors: z
      .array(
        z.object({
          message: z.string().openapi({
            example: 'invalid metricCode',
          }),
          field: z.string().openapi({
            example: 'items[0].metricCode',
          }),
        }),
      )
      .optional(),
  }),
  statusErrorResponseContractSchema,
).openapi('ErrorResponse')
