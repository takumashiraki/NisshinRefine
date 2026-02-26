# 品質ゲートルール

## ローカルゲート

- pre-commit:
  - 実行: `bun run check:staged`
  - 内容: `bun run lint`
- pre-push:
  - 実行: `bun run check:prepush`
  - 内容:
    - `bun run lint`
    - `bun run typecheck`
    - `bun run test`
    - `bun run check:generated:clean`

## CI ゲート

`quality-gates` workflow で以下を実行する:

- `bun install`
- `bun run lint`
- `bun run typecheck`
- `bun run test`
- `bun run check:generated:clean`

## 生成物同期チェック

`check:generated:clean` は以下の差分ゼロを検査する:

- `packages/api-types/openapi/status.openapi.json`
- `packages/api-types/src/generated/backend/status.zod.ts`
- `apps/frontend/src/features/status/api/generated/`

## 失敗時の扱い

- 失敗時はログの再現コマンドをローカルで実行
- 生成物差分が出た場合は再生成後に差分をコミット
- placeholder テストがある前提で、lint と生成物同期は必須として扱う
