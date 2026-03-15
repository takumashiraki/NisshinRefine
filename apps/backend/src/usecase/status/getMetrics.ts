import type { Context } from 'hono'
import StatusDatabase from './../../infrastructure/status'
import type { Env } from './../../app'
import { errorResponse } from './../response'

export const getStatusMetrics = async (
  c: Context<
    Env,
    '/status/{statusId}',
    {
      in: {
        param: {
          statusId: string
        }
      }
    }
  >,
): Promise<Response> => {
  try {
    const params = c.req.param()
    const db = new StatusDatabase()
    const { result } = await db.getMetrics(c.env.backend, params.statusId)

    if (!result) {
      return errorResponse(c, 500, 'Internal Server Error', '', '')
    }

    return c.json({ metrics: result }, 200)
  } catch (error) {
    console.error('getStatusMetrics failed', error)
    return errorResponse(c, 500, 'Internal Server Error', '', '')
  }
}
