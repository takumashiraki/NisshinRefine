# Frontend README

## 必要なバージョン

- Bun: `1.x`（ワークスペース実行基盤）
- Next.js: `^15.1.0`
- React / React DOM: `^19.0.0`
- TypeScript: `^5.9.2`

## Frontend サーバーを起動する方法

リポジトリルートで実行:

```bash
bun install
NEXT_PUBLIC_API_BASE_URL=http://localhost:8787 bun run --filter @nisshin/frontend dev
```

または `apps/frontend` で実行:

```bash
cd apps/frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8787 bun run dev
```

- デフォルト起動先: `http://localhost:3000`
- `NEXT_PUBLIC_API_BASE_URL` 未指定時は `http://localhost:8787` を使用します。
