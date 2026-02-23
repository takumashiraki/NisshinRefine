import type { Context } from 'hono'
import type { Env } from './../../app'
import StatusDatabase from './../../infrastructure/status'
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
  const env = c.env
  const params = c.req.param()
  const db = new StatusDatabase()

  let metrics
  try {
    ;({ result: metrics } = await db.selectStatusMetrics(env.backend, 'status_metric', { statusId: params.statusId }))
  } catch (error) {
    console.error('getStatusMetrics failed', error)
    return errorResponse(c, 500, 'Internal Server Error', '', '')
  }

  return c.json(
    {
      metrics: (metrics ?? []).map((metric) => ({
        id: Number(metric.id),
        metricCode: metric.metricCode,
        displayName: metric.displayName,
        mappingType: metric.mappingType,
        unit: metric.unit ?? undefined,
        sortOrder: Number(metric.sortOrder),
        isActive: metric.isActive === true || Number(metric.isActive) === 1,
        updatedAt: metric.updatedAt,
      })),
    },
    200,
  )
}
