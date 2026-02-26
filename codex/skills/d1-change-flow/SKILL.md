---
name: d1-change-flow
description: NisshinRefine における D1 関連変更を、安全に実装するための Skill。スキーマ、infrastructure、usecase、ロールバック観点を含めて設計・実装する。D1 クエリ、永続化挙動、DB リファクタの要求で利用する。
---

# D1 変更フロー

D1 変更をレイヤ整合性を保って実行する。

1. データ契約影響の確認
- `apps/backend/src/schemas/*` とレスポンス形の影響を先に確認する

2. infrastructure 層更新
- `apps/backend/src/infrastructure/*` にクエリ変更を適用する
- `db.batch([db.prepare(query).bind(...)])` を使う
- infrastructure は例外を投げず、安全な既定値を返す

3. usecase 層更新
- `apps/backend/src/usecase/*` に挙動を反映する
- `errorResponse()` 契約を維持する

4. ロールバックと失敗系の確認
- no-result/error パスが定義済みエラーペイロードを返すことを確認する
- 明示依頼がない限り公開エラーコードの意味を変更しない

5. ゲート実行
- `bun run lint` と `bun run test` を実行する
- API 形状を変更した場合は `bun run generate:api-types` と `bun run check:generated:clean` も実行する
