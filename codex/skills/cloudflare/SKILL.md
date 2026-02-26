---
name: cloudflare
description: 発火: Cloudflare、Workers、Wrangler、D1、MCP、Agent。関連依頼をルーティングし、必要な下位Skillへ接続する。
---

# NisshinRefine Cloudflare 連携 Skill

## 発火条件

- 依頼に `Cloudflare`, `Workers`, `Wrangler`, `D1`, `MCP`, `Agent` が含まれる
- 実装/レビューが Cloudflare 依存である

## 入力前提

- 依頼の主目的（実装/レビュー/運用）が明確である
- 変更対象（`apps/backend` か設定ファイルか）が明確である

## 実行ステップ

1. ルール確認
- `AGENTS.md` `codex/rules/06-cloudflare-mcp.md` `codex/rules/07-dynamic-routing.md` を確認する
2. 依頼を振り分け
- API 契約変更: `$api-contract-flow`
- D1 挙動変更: `$d1-change-flow`
- Wrangler 操作/環境操作: `$wrangler`
- Workers 実装監査: `$workers-best-practices`
- Agents SDK / MCP サーバー構築: `$agents-sdk` `$building-mcp-server-on-cloudflare`
- 複合要求: `$codex-orchestration` を併用する
3. MCP で一次情報取得
- Context7 で対象仕様を確認し、取得結果を前提に実装/レビューする

## 検証コマンド

- `bun run mcp:verify`
- `bun run lint`
- 必要に応じて `bun run check:generated:clean`

## 出力契約

- 適用したルーティング先 Skill を列挙する
- 実行コマンドと変更ファイルを列挙する
- 未検証項目があれば理由を明記する
