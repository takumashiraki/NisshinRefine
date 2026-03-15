import { and, asc, eq, inArray } from 'drizzle-orm'
import { statusLogsTable, statusMetricsTable, statusSeedMetrics } from '@nisshin/validation'
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
  note?: string
}

const clampScore = (value: number): number => {
  if (value < 1) {
    return 1
  }

  if (value > 10) {
    return 10
  }

  return Math.round(value)
}

const toScoreByFormulaFixedUnit = (unit: string | null | undefined, rawValue: number): number => {
  if (unit === 'ratio') {
    return clampScore(rawValue * 4)
  }

  if (unit === '%') {
    return clampScore(rawValue / 10)
  }

  if (unit === 'hour') {
    if (rawValue >= 7 && rawValue <= 8) {
      return 10
    }
    if ((rawValue >= 6 && rawValue < 7) || (rawValue > 8 && rawValue <= 9)) {
      return 8
    }
    if ((rawValue >= 5 && rawValue < 6) || (rawValue > 9 && rawValue <= 10)) {
      return 6
    }

    return 3
  }

  // Fallback for currently undefined fixed-formula units. Detailed policy is tracked in issue #13.
  return clampScore(rawValue)
}

const toScoreByMappingType = (mappingType: 'formula_fixed' | 'manual_1_10', unit: string | null | undefined, rawValue: number): number => {
  if (mappingType === 'manual_1_10') {
    return clampScore(rawValue)
  }

  return toScoreByFormulaFixedUnit(unit, rawValue)
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
          mappingType: statusMetricsTable.mappingType,
          unit: statusMetricsTable.unit,
        })
        .from(statusMetricsTable)
        .where(and(eq(statusMetricsTable.statusId, statusId), inArray(statusMetricsTable.metricCode, metricCodes)))

      const metricByCode = new Map(
        metrics.map((metric) => [
          metric.metricCode as MetricCode,
          {
            id: metric.id,
            mappingType: metric.mappingType as 'formula_fixed' | 'manual_1_10',
            unit: metric.unit,
          },
        ]),
      )

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
        const metric = metricByCode.get(item.metricCode)

        if (!metric) {
          return {
            result: null,
            error: {
              field: 'items.metricCode',
              message: `invalid metricCode: ${item.metricCode}`,
            },
          }
        }

        const score = toScoreByMappingType(metric.mappingType, metric.unit, item.rawValue)

        const [saved] = await db
          .insert(statusLogsTable)
          .values({
            statusId,
            metricId: metric.id,
            recordDate: payload.recordDate,
            rawValue: item.rawValue,
            score,
            note: item.note ?? null,
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: [statusLogsTable.statusId, statusLogsTable.metricId, statusLogsTable.recordDate],
            set: {
              rawValue: item.rawValue,
              score,
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
          score: saved?.score ?? score,
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
