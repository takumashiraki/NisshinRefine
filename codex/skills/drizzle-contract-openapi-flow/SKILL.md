---
name: drizzle-contract-openapi-flow
description: Drizzle(テーブル) -> Contract Zod(抽象化) -> OpenAPI の一方向フローで API を実装し、backend と generated を同期する。Use when: specs/*.json の追加/変更、API追加/変更、D1永続化実装、OpenAPI/orval再生成、check:idempotent 失敗対応。
---

# Drizzle Contract OpenAPI Flow

## 実行前に確認する

- 仕様の正本を `packages/validation/specs/*.json` に置く
- API 互換性方針（維持/破壊的変更）を明確にする
- 生成物を手編集しない

## 参照を読み分ける

- 仕様と実装例を確認するときは `references/spec-and-flow.md` を読む
- 既存の生成結果と整合しないときは、同ファイルの「冪等性確認」節を優先する

## 実装する

1. `specs/*.json` を更新する
- `packages/validation/specs/user.spec.json`
- `packages/validation/specs/status.spec.json`
- 新規 resource は `resource` ごとに spec を追加する

2. Contract/DB/OpenAPI を生成する
- `bun run generate:contracts`
- 生成先:
  - `packages/validation/src/generated/db/*`
  - `packages/validation/src/generated/contract/*`
  - `packages/validation/src/generated/openapi/*`

3. backend ルートを OpenAPI 層参照に統一する
- `apps/backend/src/schemas/*.ts` で `@nisshin/validation` の OpenAPI schema を使う
- route 定義にローカル手書き schema を増やさない

4. backend 永続化を実装する
- Drizzle client: `apps/backend/src/infrastructure/db/client.ts`
- query 実装: `apps/backend/src/infrastructure/*.ts`
- usecase 実装: `apps/backend/src/usecase/*`
- `POST /status` はサーバー側 `status_default` を使う

5. OpenAPI と orval 生成物を同期する
- `bun run generate:openapi`
- `bun run generate:api-types`
- または `bun run generate:all`

6. 冪等性と品質を検証する
- `bun run check:idempotent`
- `bun run lint`
- `bun run typecheck`
- `bun run test`

## 失敗時に復旧する

1. `bun run generate:contracts` を再実行する
2. `bun run generate:openapi` を再実行する
3. `bun run generate:api-types` を再実行する
4. `bun run check:idempotent` で再現性を確認する

## 制約を守る

- `packages/validation/src/generated/**` を手編集しない
- `packages/api-types/openapi/status.openapi.json` を手編集しない
- `apps/frontend/src/features/status/api/generated/**` を手編集しない
- 変更を spec と非生成コードに限定する

## 結果を報告する

- 変更した spec / schema / infrastructure / generated ファイルを列挙する
- API 互換性影響を明記する
- 実行した検証コマンドと結果を明記する
- 未実行の検証があれば理由を明記する
