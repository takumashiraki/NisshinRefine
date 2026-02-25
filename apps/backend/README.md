# Backend Migration Guide

`apps/backend` の D1 マイグレーションは `migrations/` で管理します。

## ディレクトリ

- `migrations/0001_create_user_table.sql`
- `migrations/0002_expand_user_profile_columns.sql`

## 実行コマンド

`apps/backend` で実行:

```bash
# ローカル D1 へ適用
npx wrangler d1 migrations apply nisshin-refine --local

# リモート D1 へ適用
npx wrangler d1 migrations apply nisshin-refine --remote
```

## 新しいマイグレーションを作る

```bash
npx wrangler d1 migrations create nisshin-refine <migration_name>
```

## SQL でレコードを確認する

`apps/backend` で実行:

```bash
# ローカル D1 の user テーブル件数を確認
npx wrangler d1 execute nisshin-refine --local --command 'SELECT COUNT(*) AS count FROM "user";'

# ローカル D1 の user テーブル全件を確認
npx wrangler d1 execute nisshin-refine --local --command 'SELECT * FROM "user";'
```

リモート D1 を確認する場合は `--local` を `--remote` に置き換えます。
