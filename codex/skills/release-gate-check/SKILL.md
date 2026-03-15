---
name: release-gate-check
description: 発火: pre-merge、release gate、readiness。PR前に品質ゲート、互換性、エラー契約を確認する。
---

# リリースゲート確認

## 発火条件

- 依頼に `PR前`, `release gate`, `pre-merge`, `readiness` が含まれる
- マージ前の最終確認が必要

## 入力前提

- 対象 PR の変更範囲が把握できている
- API 変更が含まれる場合は影響範囲が把握できている

## 実行ステップ

1. 品質ゲート実行
- `lint` `typecheck` `test` `check:generated:clean` を実行する
2. 破壊的変更スキャン
- ルート、レスポンス形、必須フィールドの意図しない変更を確認する
- API 変更がある場合は生成物コミット有無を確認する
3. エラー契約スキャン
- 変更 usecase で `errorResponse()` 利用が一貫しているか確認する
- エラーコード/ペイロード互換性を確認する
4. 結果整理
- 挙動変更、リスク、未検証項目を整理する

## 検証コマンド

- `bun run lint`
- `bun run typecheck`
- `bun run test`
- `bun run check:generated:clean`

## 出力契約

- 実行コマンドと結果を列挙する
- 破壊的変更リスクを有無付きで明記する
- tests/typecheck が stub の場合は制約を明記する
