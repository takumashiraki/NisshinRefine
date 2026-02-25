import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const userTable = sqliteTable('user', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const ssoAppTable = sqliteTable('sso_app', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  appCode: text('app_code').notNull(),
  displayName: text('display_name'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const userIdentityTable = sqliteTable('user_identity', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  appId: integer('app_id').notNull(),
  provider: text('provider').notNull(),
  providerSubject: text('provider_subject').notNull(),
  emailSnapshot: text('email_snapshot').notNull(),
  nameSnapshot: text('name_snapshot').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const userSessionTable = sqliteTable('user_session', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull(),
  identityId: integer('identity_id').notNull(),
  appId: integer('app_id').notNull(),
  issuedAt: text('issued_at').notNull(),
  expiresAt: text('expires_at').notNull(),
  revokedAt: text('revoked_at'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  createdAt: text('created_at').notNull(),
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
