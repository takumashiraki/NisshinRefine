/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */
// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.

import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const usersTable = sqliteTable(
  'user',
  {
    id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
    userId: text('user_id').notNull(),
    password: text('password').notNull(),
  },
  (table) => ({
    user_user_id_unique: uniqueIndex('user_user_id_unique').on(table.userId),
  }),
)

export type UserRow = typeof usersTable.$inferSelect
export type UserInsert = typeof usersTable.$inferInsert
