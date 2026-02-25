import { createRoute } from '@hono/zod-openapi'
import {
  createUserBodyOpenApiSchema,
  createUserResponseOpenApiSchema,
  updateUserBodyOpenApiSchema,
  userErrorResponseOpenApiSchema,
  userOpenApiSchema,
  userParamsOpenApiSchema,
} from '@nisshin/validation'

export const createUserRoute = createRoute({
  method: 'post',
  path: '/users',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createUserBodyOpenApiSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Create user',
      content: {
        'application/json': {
          schema: createUserResponseOpenApiSchema,
        },
      },
    },
    409: {
      description: 'Conflict',
      content: {
        'application/json': {
          schema: userErrorResponseOpenApiSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: userErrorResponseOpenApiSchema,
        },
      },
    },
  },
})

export const getUserRoute = createRoute({
  method: 'get',
  path: '/users/{id}',
  request: {
    params: userParamsOpenApiSchema,
  },
  responses: {
    200: {
      description: 'Get user',
      content: {
        'application/json': {
          schema: userOpenApiSchema,
        },
      },
    },
    404: {
      description: 'Not found',
      content: {
        'application/json': {
          schema: userErrorResponseOpenApiSchema,
        },
      },
    },
  },
})

export const updateUserRoute = createRoute({
  method: 'put',
  path: '/users/{id}',
  request: {
    params: userParamsOpenApiSchema,
    body: {
      content: {
        'application/json': {
          schema: updateUserBodyOpenApiSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Update user',
      content: {
        'application/json': {
          schema: userOpenApiSchema,
        },
      },
    },
    404: {
      description: 'Not found',
      content: {
        'application/json': {
          schema: userErrorResponseOpenApiSchema,
        },
      },
    },
  },
})

export const deleteUserRoute = createRoute({
  method: 'delete',
  path: '/users/{id}',
  request: {
    params: userParamsOpenApiSchema,
  },
  responses: {
    200: {
      description: 'Delete user',
      content: {
        'application/json': {
          schema: userOpenApiSchema,
        },
      },
    },
    404: {
      description: 'Not found',
      content: {
        'application/json': {
          schema: userErrorResponseOpenApiSchema,
        },
      },
    },
  },
})
