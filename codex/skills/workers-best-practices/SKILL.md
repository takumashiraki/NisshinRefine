---
name: workers-best-practices
description: NisshinRefine の Cloudflare Workers 実装/レビュー用 Skill。Workers 特有のアンチパターンを排除し、MCP で最新仕様を確認してから修正・レビューする。
---

# Workers ベストプラクティス (NisshinRefine)

## 先に仕様を取得する

Workers API や Wrangler 仕様は更新されるため、必要箇所は MCP で確認する。

- Context7 MCP で対象ライブラリの最新仕様を取得
- 取得できない場合のみローカル実装・既存定義を優先して推論

## レビューチェックリスト

1. `ctx.waitUntil()` を使うべき非同期処理が漏れていない
2. request 単位の状態をグローバル可変変数で保持していない
3. シークレットやトークンのハードコードがない
4. D1/Binding 参照と `wrangler.toml` が一致している
5. 変更後に `bun run lint` を通す

## リポジトリ固有ルール

- D1 クエリは `db.batch([db.prepare(query).bind(...)])`
- `errorResponse()` 契約を壊さない
- API 契約変更は `$api-contract-flow` を必ず適用
