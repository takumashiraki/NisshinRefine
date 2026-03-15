import type { Context } from 'hono'
import StatusDatabase from './../../infrastructure/status'
import type { Env } from './../../app'
import { errorResponse } from './../response'

type MetricCode = 'strength' | 'routine' | 'health'

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
  try {
    const payload = await c.req.json()

    if (!payload.items || payload.items.length === 0) {
      return errorResponse(c, 400, 'Invalid Request', 'items', 'items must not be empty')
    }

    if (!payload.statusId || payload.statusId.trim().length === 0) {
      return errorResponse(c, 400, 'Invalid Request', 'statusId', 'statusId must not be empty')
    }

    const db = new StatusDatabase()
    const statusId = payload.statusId.trim()

    const { result, error } = await db.saveStatusLogs(c.env.backend, statusId, {
      recordDate: payload.recordDate,
      items: payload.items.map((item) => ({
        metricCode: item.metricCode,
        rawValue: item.rawValue,
        note: item.note,
      })),
    })

    if (error) {
      return errorResponse(c, 400, 'Invalid Request', error.field, error.message)
    }

    if (!result) {
      return errorResponse(c, 500, 'Internal Server Error', '', '')
    }

    return c.json(result, 201)
  } catch (error) {
    console.error('postStatusLogs failed', error)
    return errorResponse(c, 500, 'Internal Server Error', '', '')
  }
}
