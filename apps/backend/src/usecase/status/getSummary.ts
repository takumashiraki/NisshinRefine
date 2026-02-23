import type { Context } from 'hono'
import type { Env } from './../../app'
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
  try {
    const query = c.req.query()
    const date = query.date ?? new Date().toISOString().slice(0, 10)

    return c.json(
      {
        date,
        statuses: [
          {
            metricCode: 'strength',
            displayName: 'Strength',
            score: 7,
          },
          {
            metricCode: 'routine',
            displayName: 'Routine',
            score: 8,
          },
          {
            metricCode: 'health',
            displayName: 'Health',
            score: 6,
          },
        ],
      },
      200,
    )
  } catch (error) {
    console.error('getStatusSummary failed', error)
    return errorResponse(c, 500, 'Internal Server Error', '', '')
  }
}
