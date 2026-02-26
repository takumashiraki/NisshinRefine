---
name: cloudflare
description: NisshinRefine 向け Cloudflare 統合 Skill。Workers/D1/デプロイ/MCP 関連タスクで、リポジトリルールに沿った最短実装フローへ誘導する。Cloudflare、Workers、D1、Wrangler、MCP、Agent などの要求で利用する。
---

# NisshinRefine Cloudflare 連携 Skill

この Skill は Cloudflare タスクをリポジトリ固有フローに接続するハブ。

## 最初に行うこと

1. `AGENTS.md` と以下ルールを読む
- `codex/rules/02-backend-hono-d1.md`
- `codex/rules/04-quality-gates.md`
- `codex/rules/05-execution-primitives.md`

2. 要求を次へ振り分ける
- API 契約変更: `$api-contract-flow`
- D1 挙動変更: `$d1-change-flow`
- Wrangler 操作/環境操作: `$wrangler`
- Worker ベストプラクティス監査: `$workers-best-practices`
- Agents SDK / MCP サーバー構築: `$agents-sdk`, `$building-mcp-server-on-cloudflare`

## MCP 優先取得ルール

Cloudflare API や CLI 仕様が絡む場合は、記憶ではなく MCP で一次情報を取る。

1. Context7 MCP で対象ライブラリ ID を解決する
2. 公式ドキュメント相当の一次情報を取得する
3. 取得結果を前提に実装・レビューする

## 出力契約

- 実行したコマンドを列挙する
- 変更ファイルと影響範囲を明示する
- 未検証項目があれば理由付きで残す
