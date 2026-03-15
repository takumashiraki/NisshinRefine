---
name: d1-change-flow
description: 発火: D1クエリ、永続化挙動、DBリファクタ。schema/infrastructure/usecase を整合させて安全に変更する。
---

# D1 変更フロー

## 発火条件

- 依頼に `D1`, `query`, `database`, `persistence` が含まれる
- `apps/backend/src/infrastructure/*` または `apps/backend/src/usecase/*` の変更が必要

## 入力前提

- 対象テーブル/カラムと変更意図が明確である
- no-result/error 時の期待レスポンスが明確である

## 実行ステップ

1. データ契約影響を確認
- `apps/backend/src/schemas/*` とレスポンス形への影響を確認する
2. infrastructure 層を更新
- `apps/backend/src/infrastructure/*` に変更を適用する
- D1 は `db.batch([db.prepare(query).bind(...)])` を使う
- 例外は投げず、安全な既定値を返す
3. usecase 層を更新
- `apps/backend/src/usecase/*` に反映する
- `errorResponse()` 契約を維持する
4. 失敗系を確認
- no-result/error で既定エラーペイロードを返すことを確認する
- 明示依頼がない限り公開エラーコードの意味を変更しない

## 検証コマンド

- `bun run lint`
- `bun run test`
- `bun run generate:api-types` (API 形状変更時)
- `bun run check:generated:clean` (API 形状変更時)

## 出力契約

- 変更した query/バインド/戻り値の差分を列挙する
- ロールバック観点と失敗系の扱いを明記する
- API 互換性影響の有無を明記する
