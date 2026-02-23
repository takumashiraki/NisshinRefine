import type { Context } from 'hono'
import type { Env } from './../../app'
import { errorResponse } from './../response'

type MetricCode = 'strength' | 'routine' | 'health'

const clampScore = (value: number): number => {
  if (value < 1) {
    return 1
  }

  if (value > 10) {
    return 10
  }

  return Math.round(value)
}

const toScore = (metricCode: MetricCode, rawValue: number): number => {
  if (metricCode === 'strength') {
    return clampScore(rawValue * 4)
  }

  if (metricCode === 'routine') {
    return clampScore(rawValue / 10)
  }

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

export const postStatusLogs = async (
  c: Context<
    Env,
    '/status',
    {
      in: {
        json: {
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
  try {
    const payload = await c.req.json()
    if (!payload.items || payload.items.length === 0) {
      return errorResponse(c, 400, 'Invalid Request', 'items', 'items must not be empty')
    }

    return c.json(
      {
        recordDate: payload.recordDate,
        items: payload.items.map((item) => ({
          metricCode: item.metricCode,
          rawValue: item.rawValue,
          score: toScore(item.metricCode, item.rawValue),
        })),
      },
      201,
    )
  } catch (error) {
    console.error('postStatusLogs failed', error)
    return errorResponse(c, 500, 'Internal Server Error', '', '')
  }
}
