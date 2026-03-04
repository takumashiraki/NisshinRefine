/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */
// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.

import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const statusMetricsTable = sqliteTable(
  'status_metrics',
  {
    id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
    statusId: text('status_id').notNull(),
    metricCode: text('metric_code').notNull(),
    displayName: text('display_name').notNull(),
    mappingType: text('mapping_type').notNull(),
    unit: text('unit'),
    sortOrder: integer('sort_order').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(1),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => ({
    status_metrics_status_metric_unique: uniqueIndex('status_metrics_status_metric_unique').on(table.statusId, table.metricCode),
    status_metrics_status_sort_idx: index('status_metrics_status_sort_idx').on(table.statusId, table.isActive, table.sortOrder),
  }),
)

export const statusLogsTable = sqliteTable(
  'status_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
    statusId: text('status_id').notNull(),
    metricId: integer('metric_id').references(() => statusMetricsTable.id).notNull(),
    recordDate: text('record_date').notNull(),
    rawValue: real('raw_value').notNull(),
    score: integer('score').notNull(),
    note: text('note'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => ({
    status_logs_status_metric_date_unique: uniqueIndex('status_logs_status_metric_date_unique').on(table.statusId, table.metricId, table.recordDate),
    status_logs_status_date_idx: index('status_logs_status_date_idx').on(table.statusId, table.recordDate),
  }),
)

export const STATUS_DEFAULT_ID = 'status_default'

export const statusSeedMetrics = [
  {
    metricCode: 'strength',
    displayName: 'Strength',
    mappingType: 'formula_fixed',
    unit: 'ratio',
    sortOrder: 10,
    isActive: true,
  },
  {
    metricCode: 'routine',
    displayName: 'Routine',
    mappingType: 'formula_fixed',
    unit: '%',
    sortOrder: 20,
    isActive: true,
  },
  {
    metricCode: 'health',
    displayName: 'Health',
    mappingType: 'formula_fixed',
    unit: 'hour',
    sortOrder: 30,
    isActive: true,
  },
] as const

export type StatusMetricRow = typeof statusMetricsTable.$inferSelect
export type StatusMetricInsert = typeof statusMetricsTable.$inferInsert
export type StatusLogRow = typeof statusLogsTable.$inferSelect
export type StatusLogInsert = typeof statusLogsTable.$inferInsert
