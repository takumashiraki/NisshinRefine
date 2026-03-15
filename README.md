# NisshinRefine

## リポジトリ概要

NisshinRefine は、日常の行動ログをゲーム的なステータスとして可視化するアプリケーションです。  
このリポジトリは Bun Workspace ベースのモノレポで、Cloudflare Workers 上の Backend と Next.js の Frontend、そして API 契約や UI の共有パッケージを同居させています。

## ディレクトリ構成

```text
NisshinRefine/
├── apps/
│   ├── backend/            # Cloudflare Workers + Hono API
│   └── frontend/           # Next.js フロントエンド
├── packages/
│   ├── api-types/          # OpenAPI 由来の生成型
│   ├── validation/         # Zod スキーマ/Result/Error
│   └── ui/                 # 共有 UI
├── codex/
│   ├── rules/              # エージェント運用ルール
│   └── skills/             # エージェント用 Skill
├── docs/                   # プロダクト/アーキテクチャ関連ドキュメント
├── scripts/codex/          # 運用スクリプト（hook/検証など）
└── tasks/                  # 作業計画と教訓
```

## Backend サーバー起動方法

```bash
bun install
bun run --filter @nisshin/backend dev
```

- 起動先: `http://localhost:8787`
- OpenAPI: `http://localhost:8787/openapi`
- Swagger UI: `http://localhost:8787/openapi/ui`

詳細は `apps/backend/README.md` を参照してください。

## Frontend サーバー起動方法

```bash
bun install
NEXT_PUBLIC_API_BASE_URL=http://localhost:8787 bun run --filter @nisshin/frontend dev
```

- 起動先: `http://localhost:3000`
- `NEXT_PUBLIC_API_BASE_URL` 未指定時は `http://localhost:8787` が既定値です。

詳細は `apps/frontend/README.md` を参照してください。

## エージェント系ドキュメントの置き場

- `AGENTS.md`: リポジトリ全体の運用ルータ（優先して参照）
- `codex/rules/`: 実装時ルール（領域別）
- `codex/skills/`: 実行フロー定義
- `docs/architecture/codex-operation-guide.md`: 初期導線（短縮版ガイド）

## pre-commit について

このリポジトリは Git Hooks を `.githooks/` で管理しています。

1. 初回セットアップ

```bash
bun run hooks:install
```

2. 設定確認

```bash
bun run hooks:verify
```

3. 実行内容

- `pre-commit`:
  - `bun run check:staged`（内部で `bun run lint`）
- `pre-push`:
  - `bun run check:prepush`
  - 実行内訳: `lint` / `typecheck` / `test` / `check:generated:clean`
