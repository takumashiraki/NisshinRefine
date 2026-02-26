# Cloudflare Skill + MCP ルール

## 目的

Cloudflare 関連実装で、古い記憶や環境依存手順による差分を防ぐ。

## 対象範囲

- Cloudflare Workers / D1 / Wrangler / Agents SDK
- Cloudflare 上での MCP サーバー/クライアント実装
- Codex の MCP 接続設定

## Skill 選定

| 依頼内容 | Skill |
|---|---|
| Cloudflare 全般の実装相談 | `codex/skills/cloudflare` |
| Wrangler 操作・設定変更 | `codex/skills/wrangler` |
| Worker コードレビュー | `codex/skills/workers-best-practices` |
| Agents SDK 導入 | `codex/skills/agents-sdk` |
| MCP サーバー構築 | `codex/skills/building-mcp-server-on-cloudflare` |

## MCP 運用ルール

1. 初回セットアップ
- `bun run mcp:setup` を実行して `~/.codex/config.toml` に `mcp_servers.context7` と `mcp_servers.serena` を追加する

2. 接続確認
- `bun run mcp:verify` を実行し、両設定の存在を確認する

3. 実装時
- Cloudflare/Wrangler/Agents SDK の仕様確認は MCP で一次情報を取得してから実装する
- 取得不能時のみ既存コードを根拠に推論し、回答に推論であることを残す

## Cloudflare Skills 置換ポリシー

- `codex/skills` の同名 Skill を正本とし、`bun run skills:sync` で `~/.codex/skills` へ同期する
- 置換対象（同名上書き）:
  - `cloudflare`
  - `wrangler`
  - `workers-best-practices`
  - `agents-sdk`
  - `building-mcp-server-on-cloudflare`

## 検証

- ルール/Skill 更新時は `bun run lint` を実行する
- Shell スクリプト更新時は `sh -n scripts/codex/setup-mcp.sh` を実行する
