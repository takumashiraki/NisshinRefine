import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

interface BaseSpec {
  resource: string
}

interface UserSpec extends BaseSpec {
  resource: 'user'
  db: {
    tableName: string
    tableVarName: string
    columns: Array<{
      name: string
      type: 'text' | 'integer' | 'real'
      primaryKey?: boolean
      autoIncrement?: boolean
      notNull?: boolean
      default?: string | number | boolean
    }>
    uniqueIndexes: Array<{
      name: string
      columns: string[]
    }>
  }
  contract: {
    createInputFields: string[]
    updateInputFields: string[]
    responseFields: string[]
  }
  openapi: {
    examples: {
      id: number
      userId: string
      password: string
      createPassword: string
      updatePassword: string
    }
  }
}

interface StatusSpec extends BaseSpec {
  resource: 'status'
  statusDefaultId: string
  enums: {
    metricCode: string[]
    mappingType: string[]
  }
  db: {
    tables: Array<{
      tableName: string
      tableVarName: string
      columns: Array<{
        name: string
        type: 'text' | 'integer' | 'real'
        primaryKey?: boolean
        autoIncrement?: boolean
        notNull?: boolean
        default?: string | number | boolean
        references?: {
          tableVarName: string
          column: string
        }
      }>
      uniqueIndexes: Array<{
        name: string
        columns: string[]
      }>
      indexes: Array<{
        name: string
        columns: string[]
      }>
    }>
    seedMetrics: Array<{
      metricCode: string
      displayName: string
      mappingType: string
      unit?: string
      sortOrder: number
      isActive: number
    }>
  }
  openapi: {
    examples: {
      statusId: string
      recordDate: string
      updatedAt: string
      rawValue: number
      score: number
      note: string
    }
  }
}

const projectRoot = resolve(import.meta.dir, '..')
const specsDir = resolve(projectRoot, 'specs')
const generatedDir = resolve(projectRoot, 'src/generated')

const normalize = (value: string): string => `${value.replace(/\r\n/g, '\n').trimEnd()}\n`

const writeDeterministic = (filePath: string, body: string): void => {
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, normalize(body), 'utf8')
}

const toSnakeCase = (value: string): string => value.replace(/[A-Z]/g, (matched) => `_${matched.toLowerCase()}`)

const toLiteral = (value: unknown): string => {
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "\\'")}'`
  }
  return `${value}`
}

const buildColumn = (column: {
  name: string
  type: 'text' | 'integer' | 'real'
  primaryKey?: boolean
  autoIncrement?: boolean
  notNull?: boolean
  default?: string | number | boolean
  references?: {
    tableVarName: string
    column: string
  }
}): string => {
  const dbName = toSnakeCase(column.name)
  let expr = ''

  if (column.type === 'text') {
    expr = `text('${dbName}')`
  } else if (column.type === 'real') {
    expr = `real('${dbName}')`
  } else if (column.name === 'isActive') {
    expr = `integer('${dbName}', { mode: 'boolean' })`
  } else {
    expr = `integer('${dbName}')`
  }

  if (column.primaryKey) {
    expr += column.autoIncrement ? '.primaryKey({ autoIncrement: true })' : '.primaryKey()'
  }

  if (column.references) {
    expr += `.references(() => ${column.references.tableVarName}.${column.references.column})`
  }

  if (column.notNull) {
    expr += '.notNull()'
  }

  if (column.default !== undefined) {
    expr += `.default(${toLiteral(column.default)})`
  }

  return `    ${column.name}: ${expr},`
}

const buildTableIndexes = (
  uniqueIndexes: Array<{ name: string; columns: string[] }>,
  indexes: Array<{ name: string; columns: string[] }>,
): string => {
  const lines: string[] = []

  for (const indexDef of [...uniqueIndexes].sort((a, b) => a.name.localeCompare(b.name))) {
    const columns = indexDef.columns.map((column) => `table.${column}`).join(', ')
    lines.push(`    ${indexDef.name}: uniqueIndex('${indexDef.name}').on(${columns}),`)
  }

  for (const indexDef of [...indexes].sort((a, b) => a.name.localeCompare(b.name))) {
    const columns = indexDef.columns.map((column) => `table.${column}`).join(', ')
    lines.push(`    ${indexDef.name}: index('${indexDef.name}').on(${columns}),`)
  }

  return lines.join('\n')
}

const generateUserFiles = (spec: UserSpec): Record<string, string> => {
  const dbColumns = spec.db.columns.map(buildColumn).join('\n')
  const dbIndexBody = buildTableIndexes(spec.db.uniqueIndexes, [])

  const dbFile = `/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */
// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.

import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const ${spec.db.tableVarName} = sqliteTable(
  '${spec.db.tableName}',
  {
${dbColumns}
  },
  (table) => ({
${dbIndexBody}
  }),
)

export type UserRow = typeof ${spec.db.tableVarName}.$inferSelect
export type UserInsert = typeof ${spec.db.tableVarName}.$inferInsert
`

  const userCreatePick = spec.contract.createInputFields
    .map((field) => `${field}: true`)
    .sort((a, b) => a.localeCompare(b))
    .join(', ')
  const userUpdatePick = spec.contract.updateInputFields
    .map((field) => `${field}: true`)
    .sort((a, b) => a.localeCompare(b))
    .join(', ')
  const userResponsePick = spec.contract.responseFields
    .map((field) => `${field}: true`)
    .sort((a, b) => a.localeCompare(b))
    .join(', ')

  const contractFile = `// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.

import { z } from 'zod'
import { createSchemaFactory } from 'drizzle-zod'
import { ${spec.db.tableVarName} } from '../db/user'

const { createInsertSchema, createSelectSchema, createUpdateSchema } = createSchemaFactory()

const userInsertBaseSchema = createInsertSchema(${spec.db.tableVarName})
const userSelectBaseSchema = createSelectSchema(${spec.db.tableVarName})
const userUpdateBaseSchema = createUpdateSchema(${spec.db.tableVarName})

export const userCreateInputContractSchema = userInsertBaseSchema.pick({ ${userCreatePick} })
export const userUpdateInputContractSchema = userUpdateBaseSchema.pick({ ${userUpdatePick} })
export const userParamsContractSchema = z.object({ userId: userSelectBaseSchema.shape.userId.min(1) })
export const userResponseContractSchema = userSelectBaseSchema.pick({ ${userResponsePick} })

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
`

  const openapiFile = `// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.

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
  _contractSchema: unknown,
): TSchema => schema

export const createUserBodyOpenApiSchema = withContract(
  z.object({
    userId: z.string().min(1).openapi({ example: '${spec.openapi.examples.userId}' }),
    password: z.string().min(1).openapi({ example: '${spec.openapi.examples.createPassword}' }),
  }),
  userCreateInputContractSchema,
).openapi('CreateUserBody')

export const updateUserBodyOpenApiSchema = withContract(
  z.object({
    password: z.string().min(1).openapi({ example: '${spec.openapi.examples.updatePassword}' }),
  }),
  userUpdateInputContractSchema,
).openapi('UpdateUserBody')

export const userParamsOpenApiSchema = withContract(
  z.object({
    userId: z.string().min(1).openapi({ example: '${spec.openapi.examples.userId}' }),
  }),
  userParamsContractSchema,
).openapi('UserParams')

export const userResponseOpenApiSchema = withContract(
  z.object({
    id: z.number().int().positive().openapi({ example: ${spec.openapi.examples.id} }),
    userId: z.string().min(1).openapi({ example: '${spec.openapi.examples.userId}' }),
    password: z.string().min(1).openapi({ example: '${spec.openapi.examples.password}' }),
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
`

  return {
    [resolve(generatedDir, 'db/user.ts')]: dbFile,
    [resolve(generatedDir, 'contract/user.ts')]: contractFile,
    [resolve(generatedDir, 'openapi/user.ts')]: openapiFile,
  }
}

const generateStatusFiles = (spec: StatusSpec): Record<string, string> => {
  const metricsTable = spec.db.tables.find((table) => table.tableVarName === 'statusMetricsTable')
  const logsTable = spec.db.tables.find((table) => table.tableVarName === 'statusLogsTable')

  if (!metricsTable || !logsTable) {
    throw new Error('status spec must include statusMetricsTable and statusLogsTable')
  }

  const metricsColumns = metricsTable.columns.map(buildColumn).join('\n')
  const metricsIndexes = buildTableIndexes(metricsTable.uniqueIndexes, metricsTable.indexes)

  const logsColumns = logsTable.columns.map(buildColumn).join('\n')
  const logsIndexes = buildTableIndexes(logsTable.uniqueIndexes, logsTable.indexes)

  const seedMetricsBody = [...spec.db.seedMetrics]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((metric) => {
      const unit = metric.unit ? `'${metric.unit}'` : 'undefined'
      return `  {
    metricCode: '${metric.metricCode}',
    displayName: '${metric.displayName}',
    mappingType: '${metric.mappingType}',
    unit: ${unit},
    sortOrder: ${metric.sortOrder},
    isActive: ${metric.isActive === 1 ? 'true' : 'false'},
  },`
    })
    .join('\n')

  const metricCodeEnum = spec.enums.metricCode.map((code) => `'${code}'`).join(', ')
  const mappingTypeEnum = spec.enums.mappingType.map((code) => `'${code}'`).join(', ')

  const dbFile = `/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */
// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.

import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const ${metricsTable.tableVarName} = sqliteTable(
  '${metricsTable.tableName}',
  {
${metricsColumns}
  },
  (table) => ({
${metricsIndexes}
  }),
)

export const ${logsTable.tableVarName} = sqliteTable(
  '${logsTable.tableName}',
  {
${logsColumns}
  },
  (table) => ({
${logsIndexes}
  }),
)

export const STATUS_DEFAULT_ID = '${spec.statusDefaultId}'

export const statusSeedMetrics = [
${seedMetricsBody}
] as const

export type StatusMetricRow = typeof ${metricsTable.tableVarName}.$inferSelect
export type StatusMetricInsert = typeof ${metricsTable.tableVarName}.$inferInsert
export type StatusLogRow = typeof ${logsTable.tableVarName}.$inferSelect
export type StatusLogInsert = typeof ${logsTable.tableVarName}.$inferInsert
`

  const contractFile = `// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.

import { z } from 'zod'
import { createSchemaFactory } from 'drizzle-zod'
import { statusLogsTable, statusMetricsTable } from '../db/status'

const { createInsertSchema, createSelectSchema } = createSchemaFactory()

const statusMetricSelectBaseSchema = createSelectSchema(statusMetricsTable)
const statusLogInsertBaseSchema = createInsertSchema(statusLogsTable)

export const statusMetricCodeContractSchema = z.enum([${metricCodeEnum}])
export const statusMappingTypeContractSchema = z.enum([${mappingTypeEnum}])

export const statusParamsContractSchema = z.object({
  statusId: statusMetricSelectBaseSchema.shape.statusId.min(1),
})

export const statusSummaryQueryContractSchema = z.object({
  date: statusLogInsertBaseSchema.shape.recordDate.regex(/^\\d{4}-\\d{2}-\\d{2}$/).optional(),
})

export const statusMetricResponseContractSchema = z.object({
  id: statusMetricSelectBaseSchema.shape.id.int().positive(),
  metricCode: statusMetricCodeContractSchema,
  displayName: statusMetricSelectBaseSchema.shape.displayName.min(1),
  mappingType: statusMappingTypeContractSchema,
  unit: statusMetricSelectBaseSchema.shape.unit.optional(),
  sortOrder: statusMetricSelectBaseSchema.shape.sortOrder.int().nonnegative(),
  isActive: statusMetricSelectBaseSchema.shape.isActive,
  updatedAt: statusMetricSelectBaseSchema.shape.updatedAt,
})

export const statusMetricsListResponseContractSchema = z.object({
  metrics: z.array(statusMetricResponseContractSchema),
})

export const statusSummaryItemResponseContractSchema = z.object({
  metricCode: statusMetricCodeContractSchema,
  displayName: z.string().min(1),
  score: z.number().int().min(1).max(10),
})

export const statusSummaryResponseContractSchema = z.object({
  date: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
  statuses: z.array(statusSummaryItemResponseContractSchema),
})

export const statusLogCreateItemInputContractSchema = z.object({
  metricCode: statusMetricCodeContractSchema,
  rawValue: statusLogInsertBaseSchema.shape.rawValue,
  note: statusLogInsertBaseSchema.shape.note.optional(),
})

export const statusLogsCreateInputContractSchema = z.object({
  recordDate: statusLogInsertBaseSchema.shape.recordDate.regex(/^\\d{4}-\\d{2}-\\d{2}$/),
  items: z.array(statusLogCreateItemInputContractSchema).min(1),
})

export const statusLogCreateItemResponseContractSchema = z.object({
  metricCode: statusMetricCodeContractSchema,
  rawValue: z.number(),
  score: z.number().int().min(1).max(10),
})

export const statusLogsCreateResponseContractSchema = z.object({
  recordDate: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
  items: z.array(statusLogCreateItemResponseContractSchema),
})

export const statusErrorResponseContractSchema = z.object({
  error_code: z.string(),
  errors: z
    .array(
      z.object({
        message: z.string(),
        field: z.string(),
      }),
    )
    .optional(),
})
`

  const openapiFile = `// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.

import { z } from '@hono/zod-openapi'
import {
  statusErrorResponseContractSchema,
  statusLogsCreateInputContractSchema,
  statusLogsCreateResponseContractSchema,
  statusMappingTypeContractSchema,
  statusMetricCodeContractSchema,
  statusMetricResponseContractSchema,
  statusMetricsListResponseContractSchema,
  statusParamsContractSchema,
  statusSummaryItemResponseContractSchema,
  statusSummaryQueryContractSchema,
  statusSummaryResponseContractSchema,
} from '../contract/status'

const withContract = <TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  _contractSchema: unknown,
): TSchema => schema

export const metricCodeOpenApiSchema = withContract(
  z.enum([${metricCodeEnum}]),
  statusMetricCodeContractSchema,
).openapi('MetricCode')

export const mappingTypeOpenApiSchema = withContract(
  z.enum([${mappingTypeEnum}]),
  statusMappingTypeContractSchema,
).openapi('MappingType')

export const statusMetricOpenApiSchema = withContract(
  z.object({
    id: z.number().int().positive().openapi({ example: 1 }),
    metricCode: metricCodeOpenApiSchema,
    displayName: z.string().min(1).openapi({ example: 'Strength' }),
    mappingType: mappingTypeOpenApiSchema,
    unit: z.string().optional().openapi({ example: 'ratio' }),
    sortOrder: z.number().int().nonnegative().openapi({ example: 10 }),
    isActive: z.boolean().openapi({ example: true }),
    updatedAt: z.string().openapi({
      example: '${spec.openapi.examples.updatedAt}',
    }),
  }),
  statusMetricResponseContractSchema,
).openapi('StatusMetric')

export const statusMetricsListResponseOpenApiSchema = withContract(
  z.object({
    metrics: z.array(statusMetricOpenApiSchema),
  }),
  statusMetricsListResponseContractSchema,
).openapi('StatusMetricsListResponse')

export const statusSummaryItemOpenApiSchema = withContract(
  z.object({
    metricCode: metricCodeOpenApiSchema,
    displayName: z.string().min(1).openapi({ example: 'Health' }),
    score: z.number().int().min(1).max(10).openapi({ example: ${spec.openapi.examples.score} }),
  }),
  statusSummaryItemResponseContractSchema,
).openapi('StatusSummaryItem')

export const statusSummaryResponseOpenApiSchema = withContract(
  z.object({
    date: z.string().openapi({ example: '${spec.openapi.examples.recordDate}' }),
    statuses: z.array(statusSummaryItemOpenApiSchema),
  }),
  statusSummaryResponseContractSchema,
).openapi('StatusSummaryResponse')

export const createStatusLogsRequestOpenApiSchema = withContract(
  z.object({
    recordDate: z.string().openapi({ example: '${spec.openapi.examples.recordDate}' }),
    items: z
      .array(
        z.object({
          metricCode: metricCodeOpenApiSchema,
          rawValue: z.number().openapi({ example: ${spec.openapi.examples.rawValue} }),
          note: z.string().optional().openapi({ example: '${spec.openapi.examples.note}' }),
        }),
      )
      .min(1),
  }),
  statusLogsCreateInputContractSchema,
).openapi('CreateStatusLogsRequest')

export const createStatusLogsResponseOpenApiSchema = withContract(
  z.object({
    recordDate: z.string().openapi({ example: '${spec.openapi.examples.recordDate}' }),
    items: z.array(
      z.object({
        metricCode: metricCodeOpenApiSchema,
        rawValue: z.number().openapi({
          example: ${spec.openapi.examples.rawValue},
        }),
        score: z.number().int().min(1).max(10).openapi({ example: ${spec.openapi.examples.score} }),
      }),
    ),
  }),
  statusLogsCreateResponseContractSchema,
).openapi('CreateStatusLogsResponse')

export const statusParamsOpenApiSchema = withContract(
  z.object({
    statusId: z.string().min(1).openapi({ example: '${spec.openapi.examples.statusId}' }),
  }),
  statusParamsContractSchema,
).openapi('StatusParams')

export const statusSummaryQueryOpenApiSchema = withContract(
  z.object({
    date: z.string().optional().openapi({ example: '${spec.openapi.examples.recordDate}' }),
  }),
  statusSummaryQueryContractSchema,
).openapi('StatusSummaryQuery')

export const errorResponseOpenApiSchema = withContract(
  z.object({
    error_code: z.string().openapi({ example: 'Invalid Request' }),
    errors: z
      .array(
        z.object({
          message: z.string().openapi({
            example: 'invalid metricCode',
          }),
          field: z.string().openapi({
            example: 'items[0].metricCode',
          }),
        }),
      )
      .optional(),
  }),
  statusErrorResponseContractSchema,
).openapi('ErrorResponse')
`

  return {
    [resolve(generatedDir, 'db/status.ts')]: dbFile,
    [resolve(generatedDir, 'contract/status.ts')]: contractFile,
    [resolve(generatedDir, 'openapi/status.ts')]: openapiFile,
  }
}

const generateIndexFile = (dirPath: string): string => {
  const entries = readdirSync(dirPath)
    .filter((entry) => entry.endsWith('.ts') && entry !== 'index.ts')
    .sort((a, b) => a.localeCompare(b))

  return entries.map((entry) => `export * from './${entry.replace(/\.ts$/, '')}'`).join('\n')
}

const loadSpecs = (): Array<UserSpec | StatusSpec> => {
  const files = readdirSync(specsDir)
    .filter((name) => name.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b))

  return files.map((fileName) => {
    const raw = readFileSync(resolve(specsDir, fileName), 'utf8')
    return JSON.parse(raw) as UserSpec | StatusSpec
  })
}

const run = (): void => {
  const specs = loadSpecs()
  const outputs: Record<string, string> = {}

  for (const spec of specs) {
    if (spec.resource === 'user') {
      Object.assign(outputs, generateUserFiles(spec))
      continue
    }

    if (spec.resource === 'status') {
      Object.assign(outputs, generateStatusFiles(spec))
      continue
    }

    throw new Error(`Unsupported resource spec: ${JSON.stringify(spec as BaseSpec)}`)
  }

  for (const [filePath, content] of Object.entries(outputs).sort((a, b) => a[0].localeCompare(b[0]))) {
    writeDeterministic(filePath, content)
  }

  writeDeterministic(resolve(generatedDir, 'db/index.ts'), generateIndexFile(resolve(generatedDir, 'db')))
  writeDeterministic(resolve(generatedDir, 'contract/index.ts'), generateIndexFile(resolve(generatedDir, 'contract')))
  writeDeterministic(resolve(generatedDir, 'openapi/index.ts'), generateIndexFile(resolve(generatedDir, 'openapi')))

  console.log('Contracts generated successfully.')
}

run()
