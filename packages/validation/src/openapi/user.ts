import { z } from '@hono/zod-openapi'
import { userInsertSchema } from '../drizzle/zod'

export const userOpenApiSchema = z
  .object({
    name: z.string().openapi({ example: '山田太郎' }),
    userId: z.string().uuid().openapi({ example: '11111111-1111-4111-8111-111111111111' }),
    password: z.string().nullable().openapi({ example: 'hashed_password' }),
  })
  .openapi('User')

export const userParamsOpenApiSchema = z
  .object({
    userId: z.string().uuid().openapi({ example: '11111111-1111-4111-8111-111111111111' }),
  })
  .openapi('UserParams')

export const createUserBodyOpenApiSchema = z
  .object(userInsertSchema.pick({ name: true, email: true, password: true }).shape)
  .extend({
    name: z.string().openapi({ example: '山田太郎' }),
    email: z.string().email().nullable().optional().openapi({ example: 'taro@example.com' }),
    password: z.string().nullable().optional().openapi({ example: 'secret1234' }),
  })
  .openapi('CreateUserBody')

export const updateUserBodyOpenApiSchema = z
  .object({
    password: z.string().nullable().openapi({ example: 'updated_secret' }),
  })
  .openapi('UpdateUserBody')

export const userErrorResponseOpenApiSchema = z
  .object({
    error_code: z.string().openapi({ example: 'Invalid Request' }),
    errors: z
      .array(
        z.object({
          message: z.string().openapi({ example: 'already exist' }),
          field: z.string().openapi({ example: 'userId' }),
        }),
      )
      .optional(),
  })
  .openapi('UserErrorResponse')
