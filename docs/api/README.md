# API Docs

`Drizzle -> Contract Zod -> OpenAPI` の一方向パイプラインで API 契約を管理します。

## レイヤ責務

- DB Layer (`packages/validation/src/db/*`)
  - Drizzle の `sqliteTable` 定義
  - index / unique / foreign key を定義
- Contract Layer (`packages/validation/src/contract/*`)
  - `drizzle-zod` で DB 定義から Zod を作成
  - API 入出力の DTO に整形（中間抽象）
- OpenAPI Layer (`packages/validation/src/openapi/*`)
  - Contract を検証基準にして OpenAPI 用 schema を定義
  - 例示値・schema 名などのメタデータを付与

## 仕様JSON（正本）

仕様入力は `packages/validation/specs/*.json` を正本にします。

- `packages/validation/specs/user.spec.json`
- `packages/validation/specs/status.spec.json`

例（抜粋）:

```json
{
  "resource": "status",
  "statusDefaultId": "status_default",
  "enums": {
    "metricCode": ["strength", "routine", "health"],
    "mappingType": ["formula_fixed", "manual_1_10"]
  }
}
```

`POST /status` は `statusId` をリクエストで受け取らず、バックエンド側で `status_default` を使用します。

## 生成フロー

1. `specs/*.json` を更新
2. `bun run generate:contracts`
3. `bun run --cwd apps/backend openapi:export`
4. `bun run generate:api-types`

一括実行:

```bash
bun run generate:all
```

## 冪等性確認

```bash
bun run check:idempotent
```

このコマンドは `generate:contracts` を 2 回実行し、`packages/validation/src/generated` の差分が無いことを確認します。

## 生成物の扱い

以下は生成物のため手編集禁止です。

- `packages/validation/src/generated/**`
- `packages/api-types/openapi/status.openapi.json`
- `packages/api-types/src/generated/**`
- `apps/frontend/src/features/status/api/generated/**`

変更は必ず `specs/*.json` と非生成コード（usecase / infrastructure / route 定義）から行ってください。
