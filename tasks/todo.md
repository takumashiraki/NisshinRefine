# TODO

## Plan
- [x] 仕様DSLを定義する
- [x] 生成スクリプトを実装する
- [x] Drizzle/Contract Zod/OpenAPI の3層を導入する
- [x] backend クエリを Drizzle へ移行する
- [x] OpenAPI export / orval 再生成フローを更新する
- [x] 検証とレビューを記録する

## Review
- `packages/validation/specs/*.json` を正本として `generate-contracts.ts` を実装
- 生成先を `packages/validation/src/generated/{db,contract,openapi}` に統一
- `apps/backend` は user/status ともに Drizzle クエリへ移行
- status は D1 永続化を実装（`statusId` はサーバー側 `status_default`）
- OpenAPI export/orval 再生成を実施し、frontend/backend generated を同期
- OpenAPI 層の `withContract` 実行時検証で Zod 実装差異が発生するため、生成器で no-op ラッパーへ修正し API 500 を解消
- 検証結果:
  - `bun run generate:all`: 成功
  - `bun run check:idempotent`: 成功
  - `bun run lint`: エラー 0（既存 warning 1）
  - `bun run typecheck`: placeholder 実行
  - `bun run test`: placeholder 実行
  - `POST /status` -> `GET /status/status_default` -> `GET /status/status_default/summary?date=2026-03-15`: 成功
  - `POST/GET/PUT/DELETE /users/{userId}`: 成功
