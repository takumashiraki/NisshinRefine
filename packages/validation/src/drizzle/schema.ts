import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const userTable = sqliteTable('user', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('userId').notNull(),
  password: text('password').notNull(),
})

export const statusMetricTable = sqliteTable('status_metric', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  statusId: text('status_id').notNull(),
  metricCode: text('metric_code').notNull(),
  displayName: text('display_name').notNull(),
  mappingType: text('mapping_type').notNull(),
  unit: text('unit'),
  sortOrder: integer('sort_order').notNull(),
  isActive: integer('is_active').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
})

export const statusLogTable = sqliteTable('status_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  statusId: text('status_id').notNull(),
  metricId: integer('metric_id').notNull(),
  recordDate: text('record_date').notNull(),
  rawValue: real('raw_value').notNull(),
  score: integer('score').notNull(),
  note: text('note'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
})
