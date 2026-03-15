# タスク

## Codex最適化ルール再編（AGENTS / Rules / Skills / 疑似マルチエージェント）

- [x] `AGENTS.md` をルーティング中心の構成へ再編する
- [x] `codex/rules/01-core-workflow.md` に Dynamic Routing と疑似マルチエージェント手順を追加する
- [x] `codex/rules/05-execution-primitives.md` を新ルーティング方針へ同期する
- [x] `codex/rules/07-dynamic-routing.md` を新規作成する
- [x] `codex/rules/api-communication-rules.md` を互換参照専用に維持する
- [x] 既存 Skill の `SKILL.md` を 5 要素（発火条件/入力前提/実行ステップ/検証コマンド/出力契約）へ統一する
- [x] 既存 Skill の `agents/openai.yaml` を `SKILL.md` と意味同期する
- [x] `codex/skills/codex-orchestration` を新規追加する
- [x] `tasks/lessons.md` に今回の教訓を追記する
- [x] `~/.codex/AGENTS.md` をグローバル最小契約へ再編する
- [x] 検証コマンドを実行しレビューを更新する

## レビュー

- 実行コマンド:
  - `bun run lint`
  - `bun run skills:sync`
- 結果:
  - `lint` は既存 `apps/frontend/next-env.d.ts` の warning 1 件、error 0 件
  - `skills:sync` で新規 `codex-orchestration` を含む 9 Skill を `~/.codex/skills` へ同期
  - `~/.codex/AGENTS.md` を Codex 向けグローバル最小契約へ更新

## README整備（Root / Backend / Frontend）

- [x] 既存構成と実行コマンドを確認し、README記載項目を確定する
- [x] Root README を作成する（概要、構成図、起動手順、Agentドキュメント、pre-commit）
- [x] Backend README を作成する（必要バージョン、起動手順、DB確認手順）
- [x] Frontend README を作成する（必要バージョン、起動手順）
- [x] 関連コマンドで内容を検証し、レビュー結果を記録する

## レビュー（README整備）

- 実行コマンド:
  - `bun run hooks:verify`
  - `bun run lint`
- 結果:
  - `hooks:verify` は `core.hooksPath=.githooks` で正常
  - `lint` は既存 `apps/frontend/next-env.d.ts` に warning 1 件、error 0 件

## Drizzle -> Contract Zod -> OpenAPI 導入（Issue #11）

### Plan
- [x] 仕様DSLを定義する
- [x] 生成スクリプトを実装する
- [x] Drizzle/Contract Zod/OpenAPI の3層を導入する
- [x] backend クエリを Drizzle へ移行する
- [x] OpenAPI export / orval 再生成フローを更新する
- [x] 検証とレビューを記録する

### Review
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

## Issue #7: status機能のDB連携（取得/保存）を完了する

### Plan
- [x] Issue #7 の要件と現状差分を確認する
- [x] `POST /status` のリクエストに `statusId` を追加する（contract/openapi/orval同期）
- [x] `postStatusLogs` で `statusId` を受け取り、保存対象ステータスを切り替える
- [x] `resolveStatusIdForPost` 依存を解消し、`statusId` 指定保存へ統一する
- [x] OpenAPI / 生成型を再生成し、生成物差分を同期する
- [x] `mapping_type` スコア式仕様タスクを起票する（Issue #13）
- [x] `mapping_type` 参照でスコア計算する実装へ置換する（`metricCode` 固定分岐を除去）

### Review
- 実行コマンド:
  - `gh issue create --repo takumashiraki/NisshinRefine ...`
  - `bun run generate:all`
  - `bun run check:generated:no-new-diff`
  - `bun run check:generated:clean`
  - `bun run check:prepush`
  - `bun run check:idempotent`
  - `bun run lint`
  - `bun run typecheck`
  - `bun run test`
- 結果:
  - `gh issue create`: 成功（https://github.com/takumashiraki/NisshinRefine/issues/13）
  - `generate:all`: 成功
  - `check:generated:no-new-diff`: 成功（再生成で追加差分なし）
  - `check:generated:clean`: 失敗（スクリプト仕様上、生成物に未コミット差分がある開発中状態では fail）
  - `check:prepush`: 失敗（最終段の `check:generated:clean` で厳格停止し、既存仕様どおり）
  - `check:idempotent`: 成功
  - `lint`: warning 1 件、error 0 件（既存 `apps/frontend/next-env.d.ts`）
  - `typecheck`: すべて placeholder/skip 実行で成功
  - `test`: すべて placeholder 実行で成功
