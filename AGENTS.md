# Codex Instructions (NisshinRefine)

This file migrates the repo-specific Claude rules from `op-tennis/Backend/.claude` so Codex can use them here. Follow these rules for work in this repository.

**Architecture**

Stack:
- Runtime: Cloudflare Workers
- Framework: Hono (`OpenAPIHono<Env>`) + `@hono/zod-openapi`
- Validation: Zod
- Database: Cloudflare D1 (SQLite)
- Docs: `@hono/swagger-ui` (`/ui`, `/doc`)

3-layer architecture:
```
src/schemas/       -> Zod schemas + createRoute()
src/usecase/       -> handlers (business logic)
src/infrastructure/-> D1 database classes
src/middleware/     -> auth/validation middleware
```

Dependency direction: `schemas <- usecase -> infrastructure`

Entry point: `src/app.ts`
```
const app = new OpenAPIHono<Env>()
```
Bindings include `backend` (D1Database), `ENVIRONMENT`, `LOCAL_ENDPOINT`, `ENDPOINT`, `JWT_SECRET`, `LINE_CHANNEL_ID?`.  
Extend `ContextVariableMap` with `auth: { userId, sessionId }`.

Route registration pattern:
```ts
app.openapi(createUserRoute, userCreate as any)
app.openapi(loginRoute, verifyLineIdToken as any, lineLogin as any)
```
`as any` cast is required. Add `/* eslint-disable @typescript-eslint/no-explicit-any */` at top.

Resource structure:
```
src/schemas/{resource}.ts
src/usecase/{resource}/post.ts
src/usecase/{resource}/get.ts
src/usecase/{resource}/update.ts
src/usecase/{resource}/delete.ts
src/infrastructure/{resource}.ts
```

New resource steps:
1. Add Zod schema + `createRoute()` in `src/schemas/{resource}.ts`
2. Add D1 class in `src/infrastructure/{resource}.ts`
3. Add CRUD handlers under `src/usecase/{resource}/`
4. Register in `src/app.ts` using `app.openapi()`

**Error Handling**

`errorResponse()` in `src/usecase/response.ts`:
```ts
errorResponse(c, resCode, errorCode, field, message): Response
```

Status response formats:
```json
{ "error_code": "Resource Not Found" }
```
```json
{
  "error_code": "Invalid Request",
  "errors": [{ "message": "already exist", "field": "userId" }]
}
```
```json
{ "error_code": "Internal Server Error" }
```

401 usage example:
```ts
return errorResponse(c, 401, "AUTH_ERROR", "", "Invalid LINE ID token")
```

Error codes:
`Resource Not Found`, `Invalid Request`, `Internal Server Error`, `AUTH_ERROR`,
`VALIDATION_ERROR`, `DATABASE_ERROR`, `INTERNAL_ERROR`, `NOT_FOUND`, `Page Not Found`.

Try-catch patterns:
1. Usecase: catch per DB call and return `errorResponse()`
2. Infrastructure: never throw; `console.error` and return defaults
3. `line/login` and `line/logout`: wrap whole handler in try-catch

**Infrastructure (src/infrastructure/)**

Class per resource, default export. Name: `{Resource}Database`.

Define D1 interfaces locally (do not rely on `@cloudflare/workers-types`):
```ts
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
```

Use `db.batch([db.prepare(query).bind(...)])` for all queries.  
INSERT / UPDATE / DELETE must include `RETURNING`.

Return value:
- Success: `{ result: T }`
- No result: `{ result: null }` or properties set to `undefined`
- On error: do not throw; return defaults and `console.error`

Method naming: `create{Resource}`, `select{Resource}`/`get{Resource}`, `update{Resource}`, `delete{Resource}`.  
Method signature: `(db: D1Database, table: string, ...)` with table name passed in.

**Middleware (src/middleware/)**

Verification logic is class-based, default export:
```ts
class LineVerifier {
  async verifyLineIdToken(idToken: string, channelId: string, nonce?: string) {}
}
export default LineVerifier
```

Result type:
```ts
export interface LineVerificationResult {
  success: boolean
  payload?: LineIdTokenPayload
  error?: string
}
```

External API calls use `fetch()`.  
Session verification is also exported as a function.  
Middleware is registered as `app.openapi(route, middleware as any, handler as any)`.

**Schemas (src/schemas/)**

File header:
```ts
/* eslint-disable @typescript-eslint/naming-convention */
import { z } from "zod"
import { createRoute } from "@hono/zod-openapi"
```

All properties require `.openapi({ example })`.  
Object schema needs `.openapi("Name")`.

Params schema naming: `{resource}ParamsSchema`.  
Error schema shape:
```ts
export const ErrorSchema = z
  .object({ error: z.string(), message: z.string() })
  .openapi("Error")
```

Header fields are defined in lowercase.

**Usecase (src/usecase/)**

Header template:
```ts
/* eslint-disable @typescript-eslint/naming-convention */
import type { Context } from "hono"
import UserDatabase from "./../../infrastructure/user"
import type { Env } from "./../../app"
import { errorResponse } from "./../response"
```

Handler naming: `{action}{Resource}` in camelCase.  
Signature uses `Context<Env, path, { in: { ... } }>` and returns `Promise<Response>`.

Request data access:
```
c.req.param()
await c.req.json()
c.env
c.req.header("session_id")
```

DB pattern:
```
const db = new UserDatabase()
;({ result: getReturn } = await db.selectUser(env.backend, "user", { userId }))
```

Response patterns:
```
return c.json({ userId, id, password }, 200)
return errorResponse(c, 404, "Resource Not Found", "", "")
return errorResponse(c, 409, "Invalid Request", "userId", "already exist")
return errorResponse(c, 500, "Internal Server Error", "", "")
```

Import order:
1. External packages
2. Type imports
3. infrastructure
4. same-level modules
5. schemas

**TypeScript Style**

Prettier:
```json
{
  "semi": false,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 120,
  "tabWidth": 4
}
```

ESLint naming conventions:
- default, variableLike: camelCase
- property: camelCase or snake_case
- interface, typeLike: PascalCase

File naming: camelCase.  
Directory naming: lowercase.  
Use `import type` for types.  
Top-of-file eslint-disable when needed:
```
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
```

TSConfig key settings:
```
target: ES2022
module: ESNext
moduleResolution: Node
strict: false
noImplicitAny: false
strictNullChecks: false
strictFunctionTypes: false
types: ["@cloudflare/workers-types", "node"]
```

**Git Workflow**

Commit format:
```
<type>: #<issue> <日本語説明>
```
Types: `feat`, `fix`.  
Branch: `issue/<number>`.

CI: GitHub Actions (macOS, Node 21.x).  
Checks: `npm test`, `npm run lint`.  
Pre-commit: husky + lint-staged (`eslint --fix` on `*.{ts,tsx}`).

Commands:
```
npm run build
npm run dev
npm run lint
npm run lint:fix
npm test
npm run deploy
```

PR base branch: `main`.

**Issue Implementation Flow (from .claude/commands/implement.md)**

Follow: Understand -> Plan -> Execute.  
Be concise. Avoid verbose explanations. Prefer small diffs.  
Keep logs in Japanese when the user writes in Japanese.  
Maintain production quality even with token minimization.
