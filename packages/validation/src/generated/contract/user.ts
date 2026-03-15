// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.

import { z } from 'zod'
import { createSchemaFactory } from 'drizzle-zod'
import { usersTable } from '../db/user'

const { createInsertSchema, createSelectSchema, createUpdateSchema } = createSchemaFactory()

const userInsertBaseSchema = createInsertSchema(usersTable)
const userSelectBaseSchema = createSelectSchema(usersTable)
const userUpdateBaseSchema = createUpdateSchema(usersTable)

export const userCreateInputContractSchema = userInsertBaseSchema.pick({ password: true, userId: true })
export const userUpdateInputContractSchema = userUpdateBaseSchema.pick({ password: true })
export const userParamsContractSchema = z.object({ userId: userSelectBaseSchema.shape.userId.min(1) })
export const userResponseContractSchema = userSelectBaseSchema.pick({ id: true, password: true, userId: true })

export const userErrorItemResponseContractSchema = z.object({
  message: z.string(),
  field: z.string(),
})

export const userErrorResponseContractSchema = z.object({
  error_code: z.string(),
  errors: z.array(userErrorItemResponseContractSchema).optional(),
})

export type UserCreateInputContract = z.input<typeof userCreateInputContractSchema>
export type UserCreateOutputContract = z.output<typeof userCreateInputContractSchema>
export type UserUpdateInputContract = z.input<typeof userUpdateInputContractSchema>
export type UserUpdateOutputContract = z.output<typeof userUpdateInputContractSchema>
export type UserResponseInputContract = z.input<typeof userResponseContractSchema>
export type UserResponseOutputContract = z.output<typeof userResponseContractSchema>
