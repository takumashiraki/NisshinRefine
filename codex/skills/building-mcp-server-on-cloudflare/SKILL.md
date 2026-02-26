---
name: building-mcp-server-on-cloudflare
description: Cloudflare Workers 上で MCP サーバーを構築するための NisshinRefine 向け Skill。MCP ツール追加、認証方式設計、ローカル検証、運用導入までを扱う。
---

# Cloudflare で MCP サーバー構築 (NisshinRefine)

## 目的

Codex から利用可能な MCP サーバーを安全に構築し、運用へ接続する。

## ワークフロー

1. 要件整理
- 公開範囲: 認証なし / OAuth 必須
- 提供能力: tool / resource / prompt
- 運用場所: 既存 Worker へ統合 or 新規 Worker

2. 実装
- Cloudflare Workers + Agents SDK (`McpAgent`) を利用
- tool 入力は Zod などで検証
- 失敗時レスポンスを明確化

3. ローカル検証
- `wrangler dev` で `/mcp` エンドポイントを確認
- `@modelcontextprotocol/inspector` などで疎通確認

4. Codex 側接続
- `bun run mcp:setup` で Context7 MCP を設定
- 追加 MCP は `~/.codex/config.toml` の `[mcp_servers.*]` に追記

5. リリース前確認
- `bun run lint`
- 影響範囲に応じて `bun run check:generated:clean`

## ガードレール

- 本番用認証方式を未確定のまま公開しない
- 権限の強い tool は入力制約・監査ログを必須にする
- MCP 仕様変更時は必ず一次情報を取得して追随する
