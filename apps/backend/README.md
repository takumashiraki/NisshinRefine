# Backend README

## 必要なバージョン

- Bun: `1.x`（ワークスペース実行基盤）
- Wrangler: `^4.34.0`（`apps/backend/package.json`）

補足:
- `wrangler dev` はローカル D1 を `.wrangler/state` 配下に作成して利用します。
- リモート D1 を使う場合は `wrangler.toml` の `database_id` を設定してください。

## Backend サーバーを起動する方法

リポジトリルートで実行:

```bash
bun install
bun run --filter @nisshin/backend dev
```

または `apps/backend` で実行:

```bash
cd apps/backend
bun run dev
```

- デフォルト起動先: `http://localhost:8787`
- OpenAPI JSON: `http://localhost:8787/openapi`
- Swagger UI: `http://localhost:8787/openapi/ui`

## DB の中身を確認する方法

### 1. CLI（Wrangler）で確認

テーブル一覧（ローカル D1）:

```bash
cd apps/backend
npx wrangler d1 execute nisshin-refine --local --command "SELECT name FROM sqlite_master WHERE type='table';"
```

データ確認例:

```bash
cd apps/backend
npx wrangler d1 execute nisshin-refine --local --command "SELECT * FROM user LIMIT 20;"
```

### 2. `cloudflare-d1-viewer` を使う（現在運用）

- リポジトリ: <https://github.com/zoubingwu/cloudflare-d1-viewer>
- ローカル DB ファイルを対象にして確認できます。
- 本リポジトリのローカル DB 例:
  - `apps/backend/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite`

### 3. 代替: LibSQL Studio / SQLite GUI（DB Browser / Studio）

- 上記と同じ `.sqlite` ファイルを開いて参照できます。
- `*-wal` / `*-shm` を含むため、参照前に `wrangler dev` を停止してから開くと安全です。
