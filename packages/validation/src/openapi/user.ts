import { z } from '@hono/zod-openapi'

export const userOpenApiSchema = z
  .object({
    id: z.number().int().openapi({ example: 1 }),
    name: z.string().openapi({ example: '山田太郎' }),
    email: z.string().email().openapi({ example: 'taro@example.com' }),
  })
  .openapi('User')

export const userParamsOpenApiSchema = z
  .object({
    id: z.coerce.number().int().positive().openapi({ example: 1 }),
  })
  .openapi('UserParams')

export const createUserBodyOpenApiSchema = z
  .object({
    provider: z.enum(['google', 'line', 'apple']).openapi({ example: 'google' }),
    providerSubject: z.string().openapi({ example: '1133557799' }),
    appCode: z.string().openapi({ example: 'nisshin-web' }),
    name: z.string().openapi({ example: '山田太郎' }),
    email: z.string().email().openapi({ example: 'taro@example.com' }),
    expiresAt: z.string().openapi({ example: '2026-03-01T00:00:00.000Z' }),
    userAgent: z.string().optional().openapi({ example: 'Mozilla/5.0' }),
    ipAddress: z.string().optional().openapi({ example: '203.0.113.10' }),
  })
  .openapi('CreateUserBody')

export const updateUserBodyOpenApiSchema = z
  .object({
    name: z.string().optional().openapi({ example: '山田太郎' }),
    email: z.string().email().optional().openapi({ example: 'taro@example.com' }),
  })
  .openapi('UpdateUserBody')

export const createUserResponseOpenApiSchema = z
  .object({
    user: userOpenApiSchema,
    identity: z.object({
      id: z.number().int().openapi({ example: 1 }),
      provider: z.enum(['google', 'line', 'apple']).openapi({ example: 'google' }),
      appCode: z.string().openapi({ example: 'nisshin-web' }),
    }),
    session: z.object({
      sessionId: z.string().uuid().openapi({ example: '11111111-1111-4111-8111-111111111111' }),
      expiresAt: z.string().openapi({ example: '2026-03-01T00:00:00.000Z' }),
    }),
  })
  .openapi('CreateUserResponse')

export const userErrorResponseOpenApiSchema = z
  .object({
    error_code: z.string().openapi({ example: 'Invalid Request' }),
    errors: z
      .array(
        z.object({
          message: z.string().openapi({ example: 'already exist' }),
          field: z.string().openapi({ example: 'id' }),
        }),
      )
      .optional(),
  })
  .openapi('UserErrorResponse')
