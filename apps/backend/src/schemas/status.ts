import { createRoute } from '@hono/zod-openapi'
import {
  createStatusLogsRequestOpenApiSchema,
  createStatusLogsResponseOpenApiSchema,
  errorResponseOpenApiSchema,
  statusMetricsListResponseOpenApiSchema,
  statusParamsOpenApiSchema,
  statusSummaryQueryOpenApiSchema,
  statusSummaryResponseOpenApiSchema,
} from '@nisshin/validation'

export const getStatusMetricsRoute = createRoute({
  method: 'get',
  path: '/status/{statusId}',
  request: {
    params: statusParamsOpenApiSchema,
  },
  responses: {
    200: {
      description: 'Get status metrics',
      content: {
        'application/json': {
          schema: statusMetricsListResponseOpenApiSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: errorResponseOpenApiSchema,
        },
      },
    },
  },
})

export const getStatusSummaryRoute = createRoute({
  method: 'get',
  path: '/status/{statusId}/summary',
  request: {
    params: statusParamsOpenApiSchema,
    query: statusSummaryQueryOpenApiSchema,
  },
  responses: {
    200: {
      description: 'Get status summary',
      content: {
        'application/json': {
          schema: statusSummaryResponseOpenApiSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: errorResponseOpenApiSchema,
        },
      },
    },
  },
})

export const postStatusLogsRoute = createRoute({
  method: 'post',
  path: '/status',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createStatusLogsRequestOpenApiSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Create status logs',
      content: {
        'application/json': {
          schema: createStatusLogsResponseOpenApiSchema,
        },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: errorResponseOpenApiSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: errorResponseOpenApiSchema,
        },
      },
    },
  },
})
