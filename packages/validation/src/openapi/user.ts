import { z } from '@hono/zod-openapi'
import { userInsertSchema, userSelectSchema } from '../drizzle/zod'

export const userOpenApiSchema = z
  .object(userSelectSchema.shape)
  .extend({
    userId: z.string().uuid().openapi({ example: '11111111-1111-4111-8111-111111111111' }),
    id: z.number().openapi({ example: 1 }),
    password: z.string().openapi({ example: 'hashed_password' }),
  })
  .openapi('User')

export const userParamsOpenApiSchema = z
  .object({
    userId: z.string().uuid().openapi({ example: '11111111-1111-4111-8111-111111111111' }),
  })
  .openapi('UserParams')

export const createUserBodyOpenApiSchema = z
  .object(userInsertSchema.pick({ userId: true, password: true }).shape)
  .extend({
    userId: z.string().uuid().openapi({ example: '11111111-1111-4111-8111-111111111111' }),
    password: z.string().openapi({ example: 'secret1234' }),
  })
  .openapi('CreateUserBody')

export const updateUserBodyOpenApiSchema = z
  .object({
    password: z.string().openapi({ example: 'updated_secret' }),
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
