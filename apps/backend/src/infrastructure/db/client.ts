import { drizzle } from 'drizzle-orm/d1'
import { statusLogsTable, statusMetricsTable, usersTable } from '@nisshin/validation'

export const createDb = (database: unknown) =>
  drizzle(database as any, {
    schema: {
      usersTable,
      statusMetricsTable,
      statusLogsTable,
    },
  })

export type AppDatabase = ReturnType<typeof createDb>
