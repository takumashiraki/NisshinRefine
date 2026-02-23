import { and, asc, eq, isNull } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { statusLogTable, statusMetricTable } from '@nisshin/validation'

interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>
}

interface D1PreparedStatement {
  bind(...values: (string | number | Date | null)[]): D1PreparedStatement
}

interface D1Result {
  results?: Record<string, string | number | Date | null>[]
  success: boolean
  error?: string
}

interface StatusMetricRow {
  id: number
  metricCode: string
  displayName: string
  mappingType: string
  unit?: string
  sortOrder: number
  isActive: number | boolean
  updatedAt: string
}

interface StatusSummaryRow {
  metricCode: string
  displayName: string
  score: number
}

interface StatusMetricForLogRow {
  id: number
  metricCode: string
  mappingType: string
}

interface StatusLogRow {
  rawValue: number
  score: number
}

class StatusDatabase {
  async selectStatusMetrics(
    db: D1Database,
    _table: string,
    payload: { statusId: string },
  ): Promise<{ result: StatusMetricRow[] }> {
    try {
      const database = drizzle(db as any)
      const rows = (await database
        .select({
          id: statusMetricTable.id,
          metricCode: statusMetricTable.metricCode,
          displayName: statusMetricTable.displayName,
          mappingType: statusMetricTable.mappingType,
          unit: statusMetricTable.unit,
          sortOrder: statusMetricTable.sortOrder,
          isActive: statusMetricTable.isActive,
          updatedAt: statusMetricTable.updatedAt,
        })
        .from(statusMetricTable)
        .where(and(eq(statusMetricTable.statusId, payload.statusId), isNull(statusMetricTable.deletedAt)))
        .orderBy(asc(statusMetricTable.sortOrder))) as StatusMetricRow[]
      return { result: rows }
    } catch (error) {
      console.error('selectStatusMetrics error', error)
      return { result: [] }
    }
  }

  async selectStatusSummary(
    db: D1Database,
    _logTable: string,
    _metricTable: string,
    payload: { statusId: string; recordDate: string },
  ): Promise<{ result: StatusSummaryRow[] }> {
    try {
      const database = drizzle(db as any)
      const rows = (await database
        .select({
          metricCode: statusMetricTable.metricCode,
          displayName: statusMetricTable.displayName,
          score: statusLogTable.score,
        })
        .from(statusLogTable)
        .innerJoin(
          statusMetricTable,
          and(
            eq(statusMetricTable.id, statusLogTable.metricId),
            eq(statusMetricTable.statusId, statusLogTable.statusId),
            isNull(statusMetricTable.deletedAt),
          ),
        )
        .where(
          and(
            eq(statusLogTable.statusId, payload.statusId),
            eq(statusLogTable.recordDate, payload.recordDate),
            isNull(statusLogTable.deletedAt),
          ),
        )
        .orderBy(asc(statusMetricTable.sortOrder))) as StatusSummaryRow[]
      return { result: rows }
    } catch (error) {
      console.error('selectStatusSummary error', error)
      return { result: [] }
    }
  }

  async selectStatusMetricForLog(
    db: D1Database,
    _table: string,
    payload: { statusId: string; metricCode: string },
  ): Promise<{ result: StatusMetricForLogRow | null }> {
    try {
      const database = drizzle(db as any)
      const rows = await database
        .select({
          id: statusMetricTable.id,
          metricCode: statusMetricTable.metricCode,
          mappingType: statusMetricTable.mappingType,
        })
        .from(statusMetricTable)
        .where(
          and(
            eq(statusMetricTable.statusId, payload.statusId),
            eq(statusMetricTable.metricCode, payload.metricCode),
            eq(statusMetricTable.isActive, 1),
            isNull(statusMetricTable.deletedAt),
          ),
        )
        .limit(1)
      const row = rows[0] as StatusMetricForLogRow | undefined
      return { result: row ?? null }
    } catch (error) {
      console.error('selectStatusMetricForLog error', error)
      return { result: null }
    }
  }

  async createStatusLog(
    db: D1Database,
    _table: string,
    payload: {
      statusId: string
      metricId: number
      recordDate: string
      rawValue: number
      score: number
      note?: string
    },
  ): Promise<{ result: StatusLogRow | null }> {
    try {
      const now = new Date().toISOString()
      const database = drizzle(db as any)
      const rows = await database
        .insert(statusLogTable)
        .values({
          statusId: payload.statusId,
          metricId: payload.metricId,
          recordDate: payload.recordDate,
          rawValue: payload.rawValue,
          score: payload.score,
          note: payload.note ?? null,
          createdAt: now,
          updatedAt: now,
        })
        .returning({
          rawValue: statusLogTable.rawValue,
          score: statusLogTable.score,
        })
      const row = rows[0] as StatusLogRow | undefined
      return { result: row ?? null }
    } catch (error) {
      console.error('createStatusLog error', error)
      return { result: null }
    }
  }
}

export default StatusDatabase
