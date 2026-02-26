# API 通信ルール（互換参照）

このファイルは互換参照用です。正本は `03-frontend-api-contract.md` に統合されています。

- 正本: `codex/rules/03-frontend-api-contract.md`
- 目的: API 通信フローを `zod -> OpenAPI -> Orval -> frontend` に統一する
- 禁止: 手書き API 型/hooks の追加、生成物の直接編集

実行コマンド:

- `bun run --cwd apps/backend openapi:export`
- `bun run --cwd packages/api-types generate`
- `bun run generate:api-types`
