---
name: agents-sdk
description: NisshinRefine で Agents SDK を導入・拡張するための Skill。stateful Agent、workflow、WebSocket、MCP 連携を Cloudflare Workers 上で扱うときに利用する。
---

# Agents SDK 導入 Skill (NisshinRefine)

## 利用タイミング

- Agent クラスを追加するとき
- Durable Object/Workflow ベースの長寿命処理を導入するとき
- Agent から MCP サーバー/クライアントを利用するとき

## ワークフロー

1. 影響範囲確認
- `apps/backend` に統合するか、新規 app を切るかを判断
- `wrangler.toml` の Durable Object / migration 差分を確認

2. 実装
- Agent の state と外部 I/O 境界を明確化
- API 公開が必要な場合は `schema -> OpenAPI -> Orval` フローへ接続

3. MCP 連携
- MCP サーバー/クライアント要件がある場合は `$building-mcp-server-on-cloudflare` を併用
- 依存ライブラリ仕様は Context7 MCP で取得してから実装

4. 検証
- `bun run lint`
- 必要に応じて `bun run check:generated:clean`
