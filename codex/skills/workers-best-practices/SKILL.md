---
name: workers-best-practices
description: 発火: Workers実装レビュー、waitUntil、グローバル状態、binding整合。最新仕様確認付きで改善点を抽出する。
---

# Workers ベストプラクティス (NisshinRefine)

## 発火条件

- 依頼に `Workers review`, `waitUntil`, `global state`, `binding` が含まれる
- Cloudflare Workers の品質監査が目的

## 入力前提

- 対象ファイルまたは対象機能が明確である
- 実装レビューか修正実装かが明確である

## 実行ステップ

1. 仕様確認
- Workers/Wrangler の必要箇所を Context7 で確認する
- 取得不能時のみローカル実装から推論する
2. レビュー実施
- `ctx.waitUntil()` が必要な非同期処理漏れを確認する
- request 単位状態をグローバル可変変数で保持していないか確認する
- シークレット/トークンのハードコード有無を確認する
- D1/binding 参照と `wrangler.toml` の一致を確認する
3. リポジトリ規約適用
- D1 は `db.batch([db.prepare(query).bind(...)])`
- `errorResponse()` 契約を維持
- API 契約変更は `$api-contract-flow` を併用

## 検証コマンド

- `bun run lint`
- 必要に応じて `bun run check:generated:clean`

## 出力契約

- 指摘事項を重大度順に列挙する
- 修正提案があれば対象ファイルと理由を明記する
- 推論を含む場合は推論であることを明記する
