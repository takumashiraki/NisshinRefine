---
name: agents-sdk
description: 発火: Agents SDK、stateful agent、workflow、WebSocket、MCP連携。Cloudflare Workers 上の導入/拡張を行う。
---

# Agents SDK 導入 Skill (NisshinRefine)

## 発火条件

- 依頼に `Agents SDK`, `stateful agent`, `workflow`, `WebSocket`, `MCP` が含まれる
- Agent クラス追加や Durable Object/Workflow 導入が必要

## 入力前提

- Agent の責務と永続化方針が明確である
- API 公開要否と MCP 連携要否が明確である

## 実行ステップ

1. 影響範囲確認
- `apps/backend` 統合か新規 app かを判断する
- `wrangler.toml` の Durable Object/migration 差分を確認する
2. 実装
- Agent の state と外部 I/O 境界を明確化する
- API 公開が必要なら `schema -> OpenAPI -> Orval` フローへ接続する
3. MCP 連携
- 要件がある場合は `$building-mcp-server-on-cloudflare` を併用する
- 依存仕様は Context7 で取得してから実装する

## 検証コマンド

- `bun run lint`
- `bun run check:generated:clean` (API 契約影響時)

## 出力契約

- 追加した Agent/Workflow と責務を列挙する
- migration/binding 差分の有無を明記する
- 未検証項目があれば理由を明記する
