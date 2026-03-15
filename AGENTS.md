# Codex 運用ルータ (NisshinRefine)

このファイルは、NisshinRefine で Codex がどの `rules` と `skills` を読むかを決めるルータです。詳細手順は `codex/rules/*.md` と `codex/skills/*` を正本とします。

## 0. ルーティング早見表

| 依頼タイプ | 主なトリガー語 | 読むルール | 適用 Skill | 最低限の検証 |
|---|---|---|---|---|
| API 契約変更 | endpoint, schema, openapi, orval, generated hooks | `03-frontend-api-contract.md` `05-execution-primitives.md` | `$api-contract-flow` | `bun run generate:api-types` `bun run check:generated:clean` |
| D1 挙動変更 | D1, query, persistence, DB | `02-backend-hono-d1.md` `05-execution-primitives.md` | `$d1-change-flow` | `bun run lint` `bun run test` |
| Cloudflare 全般 | Workers, Wrangler, D1 binding, deploy | `06-cloudflare-mcp.md` `07-dynamic-routing.md` | `$cloudflare` `$wrangler` `$workers-best-practices` | `bun run lint` |
| Agents SDK/MCP | Agent, McpAgent, MCP server | `06-cloudflare-mcp.md` `07-dynamic-routing.md` | `$agents-sdk` `$building-mcp-server-on-cloudflare` | `bun run lint` |
| PR 前チェック | release gate, pre-merge, readiness | `04-quality-gates.md` | `$release-gate-check` | `bun run check:prepush` |
| 複合要求 | 複数ドメイン同時依頼 | `01-core-workflow.md` `07-dynamic-routing.md` | `$codex-orchestration` + 関連 Skill | 影響範囲に応じて合成 |

## 1. 基本契約

- 先に探索し、根拠のある最小差分で変更する
- 生成物は生成フローで更新し、手編集しない
- 詳細運用はルール/Skill へ委譲し、このファイルは方針と分岐のみを保持する
- 不明点を推測で埋めず、必要なら前提を明示する

## 2. Dynamic Routing

- Dynamic Rules 相当の運用は `codex/rules/07-dynamic-routing.md` で定義する
- 判定軸は `トリガー語 + 対象パス + 依頼タイプ`
- 実装前に必ずルーティング結果を確定し、必要 Skill を選ぶ

## 3. 疑似マルチエージェント方針

- 役割は `Planner` `Investigators` `Synthesizer` の 3 つ
- `Investigators` の探索は `multi_tool_use.parallel` を使った並列調査に限定する
- 実行手順は `$codex-orchestration` と `07-dynamic-routing.md` を正本にする

## 4. Skill 一覧

- `$codex-orchestration`: 複合依頼の分割、並列調査、統合手順を適用
- `$api-contract-flow`: API 契約変更の定型フローを適用
- `$d1-change-flow`: D1 変更の安全手順を適用
- `$release-gate-check`: PR 前のゲート確認を適用
- `$cloudflare`: Cloudflare 全体タスクを標準フローへ振り分け
- `$wrangler`: Wrangler 設定/CLI 操作を適用
- `$workers-best-practices`: Workers 実装の監査観点を適用
- `$agents-sdk`: Agents SDK 導入・拡張フローを適用
- `$building-mcp-server-on-cloudflare`: Cloudflare 上の MCP サーバー構築を適用

同期コマンド:

- `bun run skills:sync`

## 5. 品質ゲート

- ローカルゲート: pre-commit `bun run check:staged`, pre-push `bun run check:prepush`
- CI ゲート: `.github/workflows/quality-gates.yml`
- 現時点では `lint` と `check:generated:clean` を特に重視する

## 6. MCP 方針

- セットアップ: `bun run mcp:setup`
- 検証: `bun run mcp:verify`
- Cloudflare/Wrangler/Agents SDK は記憶優先にせず、MCP で一次情報を取得してから実装する

## 7. 非採用ポリシー

- `CLAUDE.md` は正本にしない
- slash command は未採用
- Claude 系 sub-agent は未採用
