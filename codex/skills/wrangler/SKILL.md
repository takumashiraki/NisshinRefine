---
name: wrangler
description: NisshinRefine での Wrangler 運用 Skill。`apps/backend/wrangler.toml` を基準に、dev/deploy/D1 操作を安全に実行する。Wrangler コマンド実行や設定変更時に利用する。
---

# Wrangler 運用 Skill (NisshinRefine)

## 対象範囲

- 対象設定: `apps/backend/wrangler.toml`
- 対象実装: `apps/backend/src/*`
- 重点: D1 binding 整合、ローカル検証、設定差分の安全性

## ワークフロー

1. 現状確認
- `apps/backend/wrangler.toml` の binding / compatibility_date を確認
- 変更対象が API 契約に影響するか判定

2. 実装
- 設定変更は最小差分で行う
- D1 関連変更時は `$d1-change-flow` も適用する

3. 検証
- `bun run --cwd apps/backend dev`（必要時）
- `bun run lint`
- `bun run check:generated:clean`（API 契約に影響した場合）

## ガードレール

- 秘密情報を `wrangler.toml` やソースに直書きしない
- binding 名変更時は参照コード側も同時更新する
- 生成物が発生したら同一コミットに含める
