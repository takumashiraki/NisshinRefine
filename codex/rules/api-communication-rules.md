# API 通信ルール（互換参照のみ）

このファイルは互換参照専用です。仕様本文は保持しません。

- 正本: `codex/rules/03-frontend-api-contract.md`
- 理由: API 契約フローの重複定義を避け、正本を一箇所に固定する

参照コマンド:

- `bun run --cwd apps/backend openapi:export`
- `bun run --cwd packages/api-types generate`
- `bun run generate:api-types`
