import type { Context } from 'hono'
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
    return c.json(
      {
        metrics: [
          {
            id: 1,
            metricCode: 'strength',
            displayName: 'Strength',
            mappingType: 'formula_fixed',
            unit: 'ratio',
            sortOrder: 10,
            isActive: true,
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            metricCode: 'routine',
            displayName: 'Routine',
            mappingType: 'formula_fixed',
            unit: '%',
            sortOrder: 20,
            isActive: true,
            updatedAt: new Date().toISOString(),
          },
          {
            id: 3,
            metricCode: 'health',
            displayName: 'Health',
            mappingType: 'formula_fixed',
            unit: 'hour',
            sortOrder: 30,
            isActive: true,
            updatedAt: new Date().toISOString(),
          },
        ],
      },
      200,
    )
  } catch (error) {
    console.error('getStatusMetrics failed', error)
    return errorResponse(c, 500, 'Internal Server Error', '', '')
  }
}
