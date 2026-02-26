# フロントエンド API 契約ルール

## 原則

API 通信は `zod -> OpenAPI -> Orval -> frontend` の生成フローを正とする。

## 単一情報源

- API スキーマ:
  - `packages/validation/src/openapi/*.ts`
  - `apps/backend/src/schemas/*.ts`
- OpenAPI 出力:
  - `apps/backend/scripts/export-openapi.ts`
  - 出力: `packages/api-types/openapi/status.openapi.json`
- Orval 設定:
  - `packages/api-types/orval.config.ts`

## 生成物

- backend zod client: `packages/api-types/src/generated/backend/status.zod.ts`
- frontend hooks/models:
  - `apps/frontend/src/features/status/api/generated/status.ts`
  - `apps/frontend/src/features/status/api/generated/model/*`

## ルール

- 手書きで API 型や hooks を増やさない
- 生成物は再生成で更新する
- frontend 実装では `generated` 配下の hooks/型を利用する

## 標準コマンド

- `bun run --cwd apps/backend openapi:export`
- `bun run --cwd packages/api-types generate`
- `bun run generate:api-types`
