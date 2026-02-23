import type { Context } from 'hono'
import type { Env } from './../../app'
import StatusDatabase from './../../infrastructure/status'
import { errorResponse } from './../response'

export const getStatusSummary = async (
  c: Context<
    Env,
    '/status/{statusId}/summary',
    {
      in: {
        param: {
          statusId: string
        }
        query: {
          date?: string
        }
      }
    }
  >,
): Promise<Response> => {
  const env = c.env
  const params = c.req.param()
  const db = new StatusDatabase()

  try {
    const query = c.req.query()
    const date = query.date ?? new Date().toISOString().slice(0, 10)
    let statuses

    try {
      ;({ result: statuses } = await db.selectStatusSummary(env.backend, 'status_log', 'status_metric', {
        statusId: params.statusId,
        recordDate: date,
      }))
    } catch (error) {
      console.error('selectStatusSummary failed', error)
      return errorResponse(c, 500, 'Internal Server Error', '', '')
    }

    return c.json(
      {
        date,
        statuses: (statuses ?? []).map((status) => ({
          metricCode: status.metricCode,
          displayName: status.displayName,
          score: Number(status.score),
        })),
      },
      200,
    )
  } catch (error) {
    console.error('getStatusSummary failed', error)
    return errorResponse(c, 500, 'Internal Server Error', '', '')
  }
}
