import type { Context } from 'hono'
import type { Env } from './../../app'
import StatusDatabase from './../../infrastructure/status'
import { errorResponse } from './../response'

type MetricCode = 'strength' | 'routine' | 'health'
type MappingType = 'formula_fixed' | 'manual_1_10' | 'strength_ratio' | 'routine_percent' | 'health_sleep_hours'

const clampScore = (value: number): number => {
  if (value < 1) {
    return 1
  }

  if (value > 10) {
    return 10
  }

  return Math.round(value)
}

const toHealthSleepScore = (rawValue: number): number => {
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

const toScore = (mappingType: MappingType, rawValue: number): number => {
  if (mappingType === 'strength_ratio') {
    return clampScore(rawValue * 4)
  }

  if (mappingType === 'routine_percent') {
    return clampScore(rawValue / 10)
  }

  if (mappingType === 'health_sleep_hours') {
    return toHealthSleepScore(rawValue)
  }

  if (mappingType === 'manual_1_10') {
    return clampScore(rawValue)
  }

  if (mappingType === 'formula_fixed') {
    return clampScore(rawValue)
  }

  return clampScore(rawValue)
}

export const postStatusLogs = async (
  c: Context<
    Env,
    '/status',
    {
      in: {
        json: {
          statusId: string
          recordDate: string
          items: {
            metricCode: MetricCode
            rawValue: number
            note?: string
          }[]
        }
      }
    }
  >,
): Promise<Response> => {
  const env = c.env
  const db = new StatusDatabase()

  try {
    const payload = await c.req.json()

    if (!payload.statusId) {
      return errorResponse(c, 400, 'Invalid Request', 'statusId', 'statusId is required')
    }

    if (!payload.items || payload.items.length === 0) {
      return errorResponse(c, 400, 'Invalid Request', 'items', 'items must not be empty')
    }

    const items = []
    for (const item of payload.items) {
      let metric
      try {
        ;({ result: metric } = await db.selectStatusMetricForLog(env.backend, 'status_metric', {
          statusId: payload.statusId,
          metricCode: item.metricCode,
        }))
      } catch (error) {
        console.error('selectStatusMetricForLog failed', error)
        return errorResponse(c, 500, 'Internal Server Error', '', '')
      }

      if (!metric) {
        return errorResponse(c, 404, 'Resource Not Found', 'metricCode', `${item.metricCode} not found`)
      }

      const score = toScore(metric.mappingType as MappingType, item.rawValue)

      let created
      try {
        ;({ result: created } = await db.createStatusLog(env.backend, 'status_log', {
          statusId: payload.statusId,
          metricId: Number(metric.id),
          recordDate: payload.recordDate,
          rawValue: item.rawValue,
          score,
          note: item.note,
        }))
      } catch (error) {
        console.error('createStatusLog failed', error)
        return errorResponse(c, 500, 'Internal Server Error', '', '')
      }

      if (!created) {
        return errorResponse(c, 500, 'Internal Server Error', '', '')
      }

      items.push({
        metricCode: item.metricCode,
        rawValue: Number(created.rawValue),
        score: Number(created.score),
      })
    }

    return c.json(
      {
        recordDate: payload.recordDate,
        items,
      },
      201,
    )
  } catch (error) {
    console.error('postStatusLogs failed', error)
    return errorResponse(c, 500, 'Internal Server Error', '', '')
  }
}
