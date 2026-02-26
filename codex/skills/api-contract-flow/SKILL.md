---
name: api-contract-flow
description: 発火: API変更、エンドポイント更新、OpenAPI、Orval、generated hooks。スキーマ更新から生成物同期までを一貫実行する。
---

# API 契約フロー

## 発火条件

- 依頼に `API変更`, `endpoint`, `schema`, `openapi`, `orval`, `generated hooks` が含まれる
- `packages/validation/src/openapi/*` または `apps/backend/src/schemas/*` に変更が入る

## 入力前提

- 変更対象エンドポイントと想定レスポンス形が明確である
- 互換性要件（破壊的変更可否）が明確である

## 実行ステップ

1. スキーマ更新
- `packages/validation/src/openapi/*.ts` と `apps/backend/src/schemas/*.ts` を更新する
2. OpenAPI 再出力
- `bun run --cwd apps/backend openapi:export` を実行する
3. Orval 再生成
- `bun run --cwd packages/api-types generate` または `bun run generate:api-types` を実行する
4. フロント反映
- `apps/frontend/src/features/status/api/generated` 配下の hooks/型を利用する
- 手書き API hooks/型を追加しない
5. 差分確認
- 生成物差分を同一コミットに含める

## 検証コマンド

- `bun run --cwd apps/backend openapi:export`
- `bun run generate:api-types`
- `bun run check:generated:clean`
- `bun run lint`

## 出力契約

- 変更した schema/OpenAPI/generated ファイルを列挙する
- 破壊的変更の有無を明記する
- 未実行検証があれば理由を明記する
