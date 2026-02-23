import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import app from '../src/app'

const document = app.getOpenAPI31Document({
  openapi: '3.1.0',
  info: {
    title: 'NisshinRefine API',
    version: '0.1.0',
  },
})

const outputPath = resolve(process.cwd(), '../../packages/api-types/openapi/status.openapi.json')
mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`)

console.log(`OpenAPI exported: ${outputPath}`)
