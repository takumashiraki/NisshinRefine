# バックエンド Hono + D1 ルール

## 対象範囲

`apps/backend` の実装ルール。

## アーキテクチャ

- エントリ: `apps/backend/src/app.ts`
- レイヤ:
  - `src/schemas`: ルートスキーマ
  - `src/usecase`: ハンドラー
  - `src/infrastructure`: D1 アクセス
- 依存方向: `schemas <- usecase -> infrastructure`

## Hono

- `const app = new OpenAPIHono<Env>()` を利用
- route 登録は `app.openapi(route, handler as any)` 形式
- middleware 追加時は `app.openapi(route, middleware as any, handler as any)`

## D1

- D1 クエリは `db.batch([db.prepare(query).bind(...)])` を使う
- infrastructure 層は例外を投げず、`console.error` と既定値返却
- INSERT/UPDATE/DELETE は `RETURNING` を付ける

## エラーレスポンス

- usecase では `errorResponse(c, resCode, errorCode, field, message)` を使う
- フォーマット:
  - 単一: `{ "error_code": "Internal Server Error" }`
  - 詳細: `{ "error_code": "Invalid Request", "errors": [{ "field": "...", "message": "..." }] }`

## 命名

- handler: `actionResource` (camelCase)
- infrastructure class: `ResourceDatabase`
- method: `create/select|get/update/delete + Resource`
