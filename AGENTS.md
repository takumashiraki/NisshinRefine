# Codex 運用指示 (NisshinRefine)

このファイルは NisshinRefine における Codex 運用の唯一の正本です。Codex 最適化を優先し、詳細ルールは `codex/rules/*.md` で管理します。

## 概要

- 対象: monorepo (`apps/*`, `packages/*`, `docs/*`)
- 目的: Codex が常に同じ実装品質・変更フローで動作すること
- 運用プリミティブ選定ガイド: `codex/rules/05-execution-primitives.md`
- 基本方針:
  - まず探索し、最小差分で変更する
  - 生成物は生成フローで更新し、手編集しない
  - hooks は Codex が直接実行しない前提で、Git hooks + CI で担保する
- 詳細ルール:
  - `codex/rules/01-core-workflow.md`
  - `codex/rules/02-backend-hono-d1.md`
  - `codex/rules/03-frontend-api-contract.md`
  - `codex/rules/04-quality-gates.md`
  - `codex/rules/05-execution-primitives.md`
  - `codex/rules/06-cloudflare-mcp.md`

## リポジトリ構成

- `apps/backend`: Cloudflare Workers + Hono API
  - `src/app.ts`: `OpenAPIHono<Env>` エントリポイント
  - `src/schemas`: OpenAPI ルートスキーマ
  - `src/usecase`: ハンドラー / ビジネスロジック
  - `src/infrastructure`: D1 アクセスクラス
- `apps/frontend`: Next.js frontend
  - `src/features/status/api/generated`: Orval 生成 hooks / models
- `packages/validation`: domain/api/OpenAPI の Zod 定義
- `packages/api-types`: OpenAPI / Orval 生成物
- `codex/rules`: Codex 実装ルール
- `codex/skills`: プロジェクト専用 Skill

## コーディング規約

- TypeScript スタイルは `single quote` + `no semicolon` を維持する
- import order は `external -> type import -> internal` を基本とする
- backend は `schemas <- usecase -> infrastructure` の依存方向を守る
- D1 操作は `db.batch([db.prepare(query).bind(...)])` を使う
- `errorResponse()` のレスポンス形を崩さない
- frontend は `generated` 配下の型・hooksを利用し、手書き API 型を作らない
- ルール逸脱が必要な場合はコメントで理由を残す

## API 契約フロー

API 変更は必ず以下順序で行う:

1. `packages/validation/src/openapi` と `apps/backend/src/schemas` を更新
2. OpenAPI を再出力
   - `bun run --cwd apps/backend openapi:export`
3. Orval 生成を実行
   - `bun run --cwd packages/api-types generate`
   - または `bun run generate:api-types`
4. frontend 実装で `apps/frontend/src/features/status/api/generated` の hooks を利用
5. 生成物差分をコミットに含める

## 品質ゲート

- ローカル:
  - pre-commit: `bun run check:staged` (軽量)
  - pre-push: `bun run check:prepush` (重め)
- CI (`.github/workflows/quality-gates.yml`):
  - `bun run lint`
  - `bun run typecheck`
  - `bun run test`
  - `bun run check:generated:clean`
- 導入コマンド:
  - `bun run hooks:install`
  - `bun run hooks:verify`
- 重要:
  - Codex は hooks 自体を直接実行するのではなく、結果として hooks/CI を通る変更を作る
  - 現時点で `test` / `typecheck` は placeholder を含むため、lint + 生成物同期チェックを重視する

## Skill 利用

このリポジトリのプロジェクト Skill は `codex/skills` を正本とし、必要に応じて同期する。
使い分けの判断は `codex/rules/05-execution-primitives.md` を参照する。

- `$api-contract-flow`: API 契約変更の定型フローを実行
- `$d1-change-flow`: D1 変更時の安全手順を実行
- `$release-gate-check`: PR 前の自己検証を実行
- `$cloudflare`: Cloudflare 全体タスクをリポジトリ標準フローへ振り分け
- `$wrangler`: Wrangler 設定/CLI 運用
- `$workers-best-practices`: Workers 実装レビューと改善
- `$agents-sdk`: Agents SDK 導入・拡張
- `$building-mcp-server-on-cloudflare`: Cloudflare 上の MCP サーバー構築

ローカル同期:

- `sh scripts/codex/sync-skills.sh`
- `bun run skills:sync`

## Cloudflare Skills 置換ポリシー

- このリポジトリは Cloudflare Skills を `codex/skills/*` の同名ディレクトリで管理し、`sync-skills.sh` で `~/.codex/skills` を上書き同期する
- 外部 Skill をそのまま利用せず、NisshinRefine のルール (`codex/rules/*`) と品質ゲートへ接続した内容を正本とする

## MCP 利用

- セットアップ:
  - `bun run mcp:setup`
- 検証:
  - `bun run mcp:verify`
- 方針:
  - 仕様変化が早い Cloudflare/Agents SDK/Wrangler は、記憶優先ではなく MCP で一次情報を取得してから実装する
  - 利用する MCP サーバーは `context7` と `serena` を標準とする
  - MCP の設定正本は `~/.codex/config.toml` とし、リポジトリからは `scripts/codex/setup-mcp.sh` で冪等セットアップする

## 非採用機能ポリシー

- `CLAUDE.md`: このリポジトリでは正本として扱わない
- `slash command`: Codex 運用では未採用。必要な定型操作は `scripts/codex/*.sh` と `codex/skills/*` に定義する
- `sub-agent` (Claude 系): 未採用。Codex では `codex/skills/*/agents/openai.yaml` に集約して扱う

## 実施事項 / 禁止事項

Do:

- 変更前に既存コードと生成フローを確認する
- 小さな差分で実装し、関連ドキュメントも同時更新する
- 失敗時は再現コマンドを残す

Don't:

- 生成物 (`generated`, `status.openapi.json`, `status.zod.ts`) を手で編集しない
- 未確認の推測で API 契約やエラー形式を変えない
- hooks / CI を一時的に無効化した状態で品質保証済みと判断しない
