/* eslint-disable @typescript-eslint/naming-convention */
import { createRoute, z } from '@hono/zod-openapi'

export const ErrorSchema = z
  .object({
    error: z.string().openapi({ example: 'Invalid Request' }),
    message: z.string().openapi({ example: 'already exist' }),
  })
  .openapi('Error')

const UserSchema = z
  .object({
    userId: z.string().openapi({ example: 'user_001' }),
    id: z.number().openapi({ example: 1 }),
    password: z.string().openapi({ example: 'hashed_password' }),
  })
  .openapi('User')

const userParamsSchema = z.object({
  userId: z.string().openapi({ example: 'user_001' }),
})

const createUserBodySchema = z.object({
  userId: z.string().openapi({ example: 'user_001' }),
  password: z.string().openapi({ example: 'secret1234' }),
})

const updateUserBodySchema = z.object({
  password: z.string().openapi({ example: 'updated_secret' }),
})

const errorResponseSchema = z.object({
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

export const createUserRoute = createRoute({
  method: 'post',
  path: '/users',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createUserBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Create user',
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
    },
    409: {
      description: 'Conflict',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
})

export const getUserRoute = createRoute({
  method: 'get',
  path: '/users/{userId}',
  request: {
    params: userParamsSchema,
  },
  responses: {
    200: {
      description: 'Get user',
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
    },
    404: {
      description: 'Not found',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
})

export const updateUserRoute = createRoute({
  method: 'put',
  path: '/users/{userId}',
  request: {
    params: userParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: updateUserBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Update user',
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
    },
    404: {
      description: 'Not found',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
})

export const deleteUserRoute = createRoute({
  method: 'delete',
  path: '/users/{userId}',
  request: {
    params: userParamsSchema,
  },
  responses: {
    200: {
      description: 'Delete user',
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
    },
    404: {
      description: 'Not found',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
})
