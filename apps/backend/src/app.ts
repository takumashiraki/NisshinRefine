/* eslint-disable @typescript-eslint/no-explicit-any */
import { OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { createUserRoute, deleteUserRoute, getUserRoute, updateUserRoute } from './schemas/user'
import { createUser } from './usecase/user/post'
import { getUser } from './usecase/user/get'
import { updateUser } from './usecase/user/update'
import { deleteUser } from './usecase/user/delete'
import { getStatusMetricsRoute, getStatusSummaryRoute, postStatusLogsRoute } from './schemas/status'
import { getStatusMetrics } from './usecase/status/getMetrics'
import { getStatusSummary } from './usecase/status/getSummary'
import { postStatusLogs } from './usecase/status/postLogs'

export interface Env {
  Bindings: {
    backend: D1Database
    ENVIRONMENT: string
    LOCAL_ENDPOINT: string
    ENDPOINT: string
    JWT_SECRET: string
    LINE_CHANNEL_ID?: string
  }
  Variables: {
    auth: {
      userId: string
      sessionId: string
    }
  }
}

interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>
}

interface D1PreparedStatement {
  bind(...values: (string | number | Date | null)[]): D1PreparedStatement
}

interface D1Result {
  results?: Record<string, string | number | Date>[]
  success: boolean
  error?: string
}

const app = new OpenAPIHono<Env>()

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    title: 'NisshinRefine API',
    version: '0.1.0',
  },
})

app.get('/ui', swaggerUI({ url: '/doc' }))
app.openapi(createUserRoute, createUser as any)
app.openapi(getUserRoute, getUser as any)
app.openapi(updateUserRoute, updateUser as any)
app.openapi(deleteUserRoute, deleteUser as any)
app.openapi(getStatusMetricsRoute, getStatusMetrics as any)
app.openapi(getStatusSummaryRoute, getStatusSummary as any)
app.openapi(postStatusLogsRoute, postStatusLogs as any)

export default app
