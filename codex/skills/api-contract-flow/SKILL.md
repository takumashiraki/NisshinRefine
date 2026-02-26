---
name: api-contract-flow
description: NisshinRefine の API 契約フローを、スキーマ更新から OpenAPI/Orval 再生成、frontend 適用まで一貫して実行する Skill。API 変更、エンドポイント更新、OpenAPI、生成 hooks への言及がある場合に利用する。
---

# API 契約フロー

以下の手順を順番どおりに実行する。

1. API 定義を更新
- `packages/validation/src/openapi/*.ts` と `apps/backend/src/schemas/*.ts` を必要に応じて更新する

2. OpenAPI を出力
- `bun run --cwd apps/backend openapi:export` を実行する

3. Orval 生成物を再生成
- `bun run --cwd packages/api-types generate` または `bun run generate:api-types` を実行する

4. frontend 実装へ反映
- `apps/frontend/src/features/status/api/generated` 配下の生成 hooks/types を利用する
- 対象エンドポイントに対して手書き API hooks/types を追加しない

5. 同期確認
- `bun run check:generated:clean` を実行する
- 生成物差分を同一コミットに含める
