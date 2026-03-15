# Dynamic Routing ルール

## 目的

依頼内容から、読むべきルールと適用すべき Skill を一意に決める。
Claude の path-based dynamic rules は使わず、`rules + skills + routing table` で等価運用する。

## 判定キー

1. トリガー語
2. 対象パス
3. 依頼タイプ

3 つがそろわない場合は、`01-core-workflow.md` の探索を先に実行して確定する。

## ルーティングテーブル

| 依頼タイプ | トリガー語 | 対象パス | 読むルール | 適用 Skill | 検証コマンド |
|---|---|---|---|---|---|
| API 契約変更 | endpoint, schema, openapi, orval, generated hooks | `packages/validation/src/openapi/*` `apps/backend/src/schemas/*` `apps/frontend/src/features/status/api/generated/*` | `03-frontend-api-contract.md` | `$api-contract-flow` | `bun run generate:api-types` `bun run check:generated:clean` |
| D1 挙動変更 | d1, query, persistence, database | `apps/backend/src/infrastructure/*` `apps/backend/src/usecase/*` | `02-backend-hono-d1.md` | `$d1-change-flow` | `bun run lint` `bun run test` |
| Wrangler 設定/CLI | wrangler, binding, compatibility_date, deploy | `apps/backend/wrangler.toml` `apps/backend/src/*` | `06-cloudflare-mcp.md` | `$wrangler` | `bun run lint` |
| Workers 実装レビュー | waitUntil, global state, secret, binding | `apps/backend/src/*` | `02-backend-hono-d1.md` `06-cloudflare-mcp.md` | `$workers-best-practices` | `bun run lint` |
| Agents SDK/MCP | agent, mcp, mcpagent, inspector | `apps/backend/src/*` `scripts/codex/setup-mcp.sh` | `06-cloudflare-mcp.md` | `$agents-sdk` `$building-mcp-server-on-cloudflare` | `bun run lint` |
| PR 前ゲート確認 | pre-merge, release gate, readiness | `codex/rules/*` `.githooks/*` `scripts/codex/check-*.sh` | `04-quality-gates.md` | `$release-gate-check` | `bun run check:prepush` |
| 複合要求 | 上記トリガーが 2 種以上同時出現 | 変更対象全体 | `01-core-workflow.md` `05-execution-primitives.md` | `$codex-orchestration` + 関連 Skill | 影響範囲に応じて合成 |

## 疑似マルチエージェント運用

複合要求は次の順序で処理する:

1. `Planner`: タスク分割、成功条件、実装順の仮決め
2. `Investigators`: `multi_tool_use.parallel` で並列探索し、事実だけを収集
3. `Synthesizer`: 調査結果を統合して実装順を確定

## 出力契約

- 適用したルーティング行を明示する
- 実行コマンドと変更ファイルを列挙する
- 未実行の検証がある場合は理由を明示する
