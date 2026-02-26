---
name: release-gate-check
description: NisshinRefine の PR 前リリースゲート確認用 Skill。生成物同期、破壊的変更、エラー契約整合性を検証する。pre-merge チェック、準備完了レビュー、リリース検証の要求で利用する。
---

# リリースゲート確認

PR を作成または更新する前に、以下のチェックリストを実行する。

1. 品質ゲート
- `bun run lint` を実行する
- `bun run typecheck` を実行する
- `bun run test` を実行する
- `bun run check:generated:clean` を実行する

2. 破壊的変更スキャン
- ルートパス、レスポンス形、必須フィールドが意図せず変わっていないか確認する
- API 変更がある場合、生成物がコミットされているか確認する

3. エラー契約スキャン
- 変更した usecase で `errorResponse()` の利用が一貫しているか確認する
- エラーコードとペイロード形式の互換性を確認する

4. PR サマリー
- 挙動変更、リスク、実行コマンドを列挙する
- tests/typecheck が stub の場合はカバレッジ制約を明記する
