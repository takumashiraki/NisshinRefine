# API Communication Rules

このプロジェクトの通信実装は、必ず Zod を起点に生成フローで管理する。

## 基本方針

- 手書きで API 型や hooks を増やさない
- 仕様変更は Zod/OpenAPI 定義から行う
- 生成物は直接編集しない（再生成で更新する）

## Frontend ルール

- フロー: `zod -> openapi -> TanStack Query`
- 生成元: `packages/api-types/openapi/status.openapi.json`
- 生成先:
  - `apps/frontend/src/features/status/api/generated/status.ts`
  - `apps/frontend/src/features/status/api/generated/model/*`
- フロント実装では `generated` 配下の型・hooksを利用する

## Backend ルール

- フロー: `zod -> openapi -> orval`
- Zod/OpenAPI 定義:
  - `packages/validation/src/openapi/*.ts`
  - `apps/backend/src/schemas/*.ts`
- OpenAPI エクスポート:
  - `apps/backend/src/app.ts` の `app.doc('/openapi', ...)`
  - `apps/backend/scripts/export-openapi.ts`
- orval 生成先:
  - `packages/api-types/src/generated/backend/status.zod.ts`

## 変更手順

1. `packages/validation/src/openapi` と `apps/backend/src/schemas` を更新
2. OpenAPI を再出力  
   `bun run --cwd apps/backend openapi:export`
3. orval を再生成  
   `bun run --cwd packages/api-types generate`
4. フロントは生成された TanStack Query hooks を利用

## エンドポイント命名

- OpenAPI JSON: `/openapi`
- Swagger UI: `/openapi/ui`
- status API は users から独立したパスを使う（例: `/status/{statusId}`, `/status/{statusId}/summary`, `/status`）
