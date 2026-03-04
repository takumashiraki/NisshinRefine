// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.

import { z } from '@hono/zod-openapi'
import {
  userCreateInputContractSchema,
  userErrorResponseContractSchema,
  userParamsContractSchema,
  userResponseContractSchema,
  userUpdateInputContractSchema,
} from '../contract/user'

const withContract = <TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  contractSchema: { safeParse: (value: unknown) => { success: boolean; error?: { issues: Array<unknown> } } },
): TSchema =>
  schema.superRefine((value, ctx) => {
    const parsed = contractSchema.safeParse(value)

    if (parsed.success || !parsed.error) {
      return
    }

    for (const issue of parsed.error.issues) {
      ctx.addIssue(issue as any)
    }
  }) as TSchema

export const createUserBodyOpenApiSchema = withContract(
  z.object({
    userId: z.string().min(1).openapi({ example: 'user_001' }),
    password: z.string().min(1).openapi({ example: 'secret1234' }),
  }),
  userCreateInputContractSchema,
).openapi('CreateUserBody')

export const updateUserBodyOpenApiSchema = withContract(
  z.object({
    password: z.string().min(1).openapi({ example: 'updated_secret' }),
  }),
  userUpdateInputContractSchema,
).openapi('UpdateUserBody')

export const userParamsOpenApiSchema = withContract(
  z.object({
    userId: z.string().min(1).openapi({ example: 'user_001' }),
  }),
  userParamsContractSchema,
).openapi('UserParams')

export const userResponseOpenApiSchema = withContract(
  z.object({
    id: z.number().int().positive().openapi({ example: 1 }),
    userId: z.string().min(1).openapi({ example: 'user_001' }),
    password: z.string().min(1).openapi({ example: 'hashed_password' }),
  }),
  userResponseContractSchema,
).openapi('User')

export const userErrorResponseOpenApiSchema = withContract(
  z.object({
    error_code: z.string().openapi({ example: 'Invalid Request' }),
    errors: z
      .array(
        z.object({
          message: z.string().openapi({
            example: 'already exist',
          }),
          field: z.string().openapi({ example: 'userId' }),
        }),
      )
      .optional(),
  }),
  userErrorResponseContractSchema,
).openapi('ErrorResponse')
