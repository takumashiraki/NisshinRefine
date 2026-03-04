# API Communication Rules

このプロジェクトの通信実装は、必ず `Drizzle -> Contract Zod -> OpenAPI -> orval` の生成フローで管理する。

## 基本方針

- 手書きで API 型や hooks を増やさない
- 仕様変更は `packages/validation/specs/*.json` から行う
- 生成物は直接編集しない（再生成で更新する）

## Frontend ルール

- フロー: `spec -> contracts -> openapi -> TanStack Query`
- 生成元: `packages/api-types/openapi/status.openapi.json`
- 生成先:
  - `apps/frontend/src/features/status/api/generated/status.ts`
  - `apps/frontend/src/features/status/api/generated/model/*`
- フロント実装では `generated` 配下の型・hooksを利用する

## Backend ルール

- フロー: `spec -> drizzle schema -> contract zod -> openapi`
- 仕様入力:
  - `packages/validation/specs/*.json`
- Contract/OpenAPI 生成先:
  - `packages/validation/src/generated/*`
- OpenAPI エクスポート:
  - `apps/backend/src/app.ts` の `app.doc('/openapi', ...)`
  - `apps/backend/scripts/export-openapi.ts`
- orval 生成先:
  - `packages/api-types/src/generated/backend/status.zod.ts`

## 変更手順

1. `packages/validation/specs/*.json` を更新
2. Contract/OpenAPI 用コードを再生成
   `bun run generate:contracts`
3. OpenAPI を再出力
   `bun run --cwd apps/backend openapi:export`
4. orval を再生成
   `bun run --cwd packages/api-types generate`
5. フロントは生成された TanStack Query hooks を利用

## 冪等性

- `bun run check:idempotent` を実行し、`packages/validation/src/generated` の再生成差分が出ないことを確認する

## エンドポイント命名

- OpenAPI JSON: `/openapi`
- Swagger UI: `/openapi/ui`
- status API は users から独立したパスを使う（`/status/{statusId}`, `/status/{statusId}/summary`, `/status`）
