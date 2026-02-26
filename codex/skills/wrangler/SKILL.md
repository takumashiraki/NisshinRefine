---
name: wrangler
description: 発火: wrangler.toml 変更、Wrangler CLI 操作、binding 更新。設定と実装の整合を保って安全に運用する。
---

# Wrangler 運用 Skill (NisshinRefine)

## 発火条件

- `apps/backend/wrangler.toml` を変更する
- Wrangler CLI 実行や binding 変更が必要

## 入力前提

- 変更対象環境（local/dev/prod）が明確である
- 変更理由と影響範囲が明確である

## 実行ステップ

1. 現状確認
- `apps/backend/wrangler.toml` の binding / compatibility_date を確認する
- API 契約影響の有無を判定する
2. 変更適用
- 設定変更は最小差分で行う
- D1 関連は `$d1-change-flow` を併用する
3. 整合確認
- binding 名変更時はコード参照側を同時更新する
- 秘密情報を設定/ソースに直書きしない

## 検証コマンド

- `bun run --cwd apps/backend dev` (必要時)
- `bun run lint`
- `bun run check:generated:clean` (API 契約影響時)

## 出力契約

- 変更した binding/設定値を列挙する
- 実行コマンドと確認結果を列挙する
- API 契約影響の有無を明記する
