---
name: drizzle-contract-openapi-flow
description: 仕様書駆動で Drizzle(テーブル) -> Contract Zod(抽象化) -> OpenAPI を構築し、backend 実装と generated 同期まで一貫実行する。発火: API追加/変更、specs更新、D1永続化、OpenAPI/orval再生成、冪等性確認。
---

# Drizzle Contract OpenAPI Flow

## 入力前提

- 仕様の正本を `packages/validation/specs/*.json` で定義する
- 既存 API 互換性の方針（維持/破壊的変更）を明確にする
- 生成物の手編集を行わない

## 実行ステップ

1. 仕様を定義する
- `packages/validation/specs/user.spec.json`
- `packages/validation/specs/status.spec.json`
- 新規 resource を追加する場合は `resource` ごとに spec ファイルを追加する

2. Contract 生成を実行する
- `bun run generate:contracts`
- 生成先:
  - `packages/validation/src/generated/db/*`
  - `packages/validation/src/generated/contract/*`
  - `packages/validation/src/generated/openapi/*`

3. backend ルート定義を OpenAPI 層参照へ統一する
- `apps/backend/src/schemas/*.ts` では `@nisshin/validation` の OpenAPI schema を参照する
- route 定義内でローカル手書き schema を増やさない

4. backend 永続化を実装する
- Drizzle client: `apps/backend/src/infrastructure/db/client.ts`
- infrastructure: `apps/backend/src/infrastructure/*.ts`
- usecase: `apps/backend/src/usecase/*`
- status の `POST /status` はサーバー側 `status_default` を使う

5. OpenAPI と orval 生成物を同期する
- `bun run generate:openapi`
- `bun run generate:api-types`
- または `bun run generate:all`

6. 冪等性と品質を検証する
- `bun run check:idempotent`
- `bun run lint`
- `bun run typecheck`
- `bun run test`

## 制約

- `packages/validation/src/generated/**` は手編集しない
- `packages/api-types/openapi/status.openapi.json` は生成でのみ更新する
- `apps/frontend/src/features/status/api/generated/**` は生成でのみ更新する
- 変更は spec と非生成コードに限定する

## 失敗時の復旧手順

1. `bun run generate:contracts` を再実行する
2. `bun run generate:openapi` を再実行する
3. `bun run generate:api-types` を再実行する
4. 生成差分が不安定なら `bun run check:idempotent` で再現性を確認する

## 出力契約

- 変更した spec / schema / infrastructure / generated ファイルを列挙する
- API 互換性影響を明記する
- 実行した検証コマンドと結果を明記する
- 未実行の検証があれば理由を明記する

## 参照

- 詳細仕様と例: `references/spec-and-flow.md`
