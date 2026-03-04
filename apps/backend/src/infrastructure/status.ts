import { and, asc, eq, inArray } from 'drizzle-orm'
import { STATUS_DEFAULT_ID, statusLogsTable, statusMetricsTable, statusSeedMetrics } from '@nisshin/validation'
import { createDb } from './db/client'

type MetricCode = 'strength' | 'routine' | 'health'

interface StatusMetric {
  id: number
  metricCode: MetricCode
  displayName: string
  mappingType: 'formula_fixed' | 'manual_1_10'
  unit?: string
  sortOrder: number
  isActive: boolean
  updatedAt: string
}

interface SummaryStatus {
  metricCode: MetricCode
  displayName: string
  score: number
}

interface StatusLogInput {
  metricCode: MetricCode
  rawValue: number
  score: number
  note?: string
}

class StatusDatabase {
  private async ensureMetrics(dbBinding: unknown, statusId: string): Promise<void> {
    const db = createDb(dbBinding)

    const [existing] = await db
      .select({ id: statusMetricsTable.id })
      .from(statusMetricsTable)
      .where(eq(statusMetricsTable.statusId, statusId))
      .limit(1)

    if (existing) {
      return
    }

    const now = new Date().toISOString()

    await db.insert(statusMetricsTable).values(
      statusSeedMetrics.map((metric) => ({
        statusId,
        metricCode: metric.metricCode,
        displayName: metric.displayName,
        mappingType: metric.mappingType,
        unit: metric.unit,
        sortOrder: metric.sortOrder,
        isActive: metric.isActive,
        createdAt: now,
        updatedAt: now,
      })),
    )
  }

  resolveStatusIdForPost(): string {
    return STATUS_DEFAULT_ID
  }

  async getMetrics(dbBinding: unknown, statusId: string): Promise<{ result: StatusMetric[] | null }> {
    try {
      await this.ensureMetrics(dbBinding, statusId)
      const db = createDb(dbBinding)

      const metrics = await db
        .select({
          id: statusMetricsTable.id,
          metricCode: statusMetricsTable.metricCode,
          displayName: statusMetricsTable.displayName,
          mappingType: statusMetricsTable.mappingType,
          unit: statusMetricsTable.unit,
          sortOrder: statusMetricsTable.sortOrder,
          isActive: statusMetricsTable.isActive,
          updatedAt: statusMetricsTable.updatedAt,
        })
        .from(statusMetricsTable)
        .where(eq(statusMetricsTable.statusId, statusId))
        .orderBy(asc(statusMetricsTable.sortOrder))

      return {
        result: metrics.map((metric) => ({
          id: metric.id,
          metricCode: metric.metricCode as MetricCode,
          displayName: metric.displayName,
          mappingType: metric.mappingType as 'formula_fixed' | 'manual_1_10',
          unit: metric.unit ?? undefined,
          sortOrder: metric.sortOrder,
          isActive: metric.isActive,
          updatedAt: metric.updatedAt,
        })),
      }
    } catch (error) {
      console.error('getMetrics error', error)
      return { result: null }
    }
  }

  async getSummary(dbBinding: unknown, statusId: string, date: string): Promise<{ result: { date: string; statuses: SummaryStatus[] } | null }> {
    try {
      await this.ensureMetrics(dbBinding, statusId)
      const db = createDb(dbBinding)

      const rows = await db
        .select({
          metricCode: statusMetricsTable.metricCode,
          displayName: statusMetricsTable.displayName,
          score: statusLogsTable.score,
        })
        .from(statusMetricsTable)
        .leftJoin(
          statusLogsTable,
          and(
            eq(statusLogsTable.metricId, statusMetricsTable.id),
            eq(statusLogsTable.statusId, statusId),
            eq(statusLogsTable.recordDate, date),
          ),
        )
        .where(and(eq(statusMetricsTable.statusId, statusId), eq(statusMetricsTable.isActive, true)))
        .orderBy(asc(statusMetricsTable.sortOrder))

      return {
        result: {
          date,
          statuses: rows.map((row) => ({
            metricCode: row.metricCode as MetricCode,
            displayName: row.displayName,
            score: row.score ?? 1,
          })),
        },
      }
    } catch (error) {
      console.error('getSummary error', error)
      return { result: null }
    }
  }

  async saveStatusLogs(
    dbBinding: unknown,
    statusId: string,
    payload: { recordDate: string; items: StatusLogInput[] },
  ): Promise<{ result: { recordDate: string; items: Array<{ metricCode: MetricCode; rawValue: number; score: number }> } | null; error?: { field: string; message: string } }> {
    try {
      await this.ensureMetrics(dbBinding, statusId)
      const db = createDb(dbBinding)

      const metricCodes = [...new Set(payload.items.map((item) => item.metricCode))]

      const metrics = await db
        .select({
          id: statusMetricsTable.id,
          metricCode: statusMetricsTable.metricCode,
        })
        .from(statusMetricsTable)
        .where(and(eq(statusMetricsTable.statusId, statusId), inArray(statusMetricsTable.metricCode, metricCodes)))

      const metricByCode = new Map(metrics.map((metric) => [metric.metricCode as MetricCode, metric.id]))

      for (const item of payload.items) {
        if (!metricByCode.has(item.metricCode)) {
          return {
            result: null,
            error: {
              field: 'items.metricCode',
              message: `invalid metricCode: ${item.metricCode}`,
            },
          }
        }
      }

      const now = new Date().toISOString()
      const savedItems: Array<{ metricCode: MetricCode; rawValue: number; score: number }> = []

      for (const item of payload.items) {
        const metricId = metricByCode.get(item.metricCode)

        if (!metricId) {
          return {
            result: null,
            error: {
              field: 'items.metricCode',
              message: `invalid metricCode: ${item.metricCode}`,
            },
          }
        }

        const [saved] = await db
          .insert(statusLogsTable)
          .values({
            statusId,
            metricId,
            recordDate: payload.recordDate,
            rawValue: item.rawValue,
            score: item.score,
            note: item.note ?? null,
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: [statusLogsTable.statusId, statusLogsTable.metricId, statusLogsTable.recordDate],
            set: {
              rawValue: item.rawValue,
              score: item.score,
              note: item.note ?? null,
              updatedAt: now,
            },
          })
          .returning({
            rawValue: statusLogsTable.rawValue,
            score: statusLogsTable.score,
          })

        savedItems.push({
          metricCode: item.metricCode,
          rawValue: saved?.rawValue ?? item.rawValue,
          score: saved?.score ?? item.score,
        })
      }

      return {
        result: {
          recordDate: payload.recordDate,
          items: savedItems,
        },
      }
    } catch (error) {
      console.error('saveStatusLogs error', error)
      return { result: null }
    }
  }
}

export default StatusDatabase
