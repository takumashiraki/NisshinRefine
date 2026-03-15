import type { Context } from 'hono'
import StatusDatabase from './../../infrastructure/status'
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
    const params = c.req.param()
    const query = c.req.query()
    const date = query.date ?? new Date().toISOString().slice(0, 10)
    const db = new StatusDatabase()

    const { result } = await db.getSummary(c.env.backend, params.statusId, date)

    if (!result) {
      return errorResponse(c, 500, 'Internal Server Error', '', '')
    }

    return c.json(result, 200)
  } catch (error) {
    console.error('getStatusSummary failed', error)
    return errorResponse(c, 500, 'Internal Server Error', '', '')
  }
}
