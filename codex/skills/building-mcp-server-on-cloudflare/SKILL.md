---
name: building-mcp-server-on-cloudflare
description: 発火: MCPサーバー構築、McpAgent、tool/resource/prompt公開。Cloudflare Workers 上で安全に設計・実装する。
---

# Cloudflare で MCP サーバー構築 (NisshinRefine)

## 発火条件

- 依頼に `MCP server`, `McpAgent`, `tool/resource/prompt` が含まれる
- Cloudflare Workers 上で MCP 提供能力を実装する

## 入力前提

- 公開範囲（認証なし/OAuth 必須）が明確である
- 提供能力（tool/resource/prompt）が明確である
- 既存 Worker 統合か新規 Worker かが明確である

## 実行ステップ

1. 要件整理
- 公開範囲、提供能力、運用場所を確定する
2. 実装
- Cloudflare Workers + Agents SDK (`McpAgent`) を利用する
- tool 入力を Zod などで検証する
- 失敗時レスポンスを明確化する
3. ローカル検証
- `wrangler dev` で `/mcp` を確認する
- `@modelcontextprotocol/inspector` 等で疎通を確認する
4. Codex 接続
- `bun run mcp:setup` と `bun run mcp:verify` を実行する
- 追加 MCP は `~/.codex/config.toml` に追記する

## 検証コマンド

- `bun run mcp:verify`
- `bun run lint`
- `bun run check:generated:clean` (API 契約影響時)

## 出力契約

- 公開範囲、認証方式、提供能力を明示する
- 実行コマンドと疎通確認結果を列挙する
- 高権限 tool の制約と監査方針を明示する
