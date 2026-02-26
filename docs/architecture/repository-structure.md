# リポジトリ構成

このリポジトリは以下の構成で管理する。

- `apps/backend`: Cloudflare Workers + Hono API
- `apps/frontend`: Next.js frontend
- `packages/validation`: domain/API/OpenAPI スキーマ + 共有 Result/error 型
- `packages/api-types`: 生成・派生された API 契約型
- `packages/ui`: 共有 UI パッケージ
- `codex/rules`: Codex 運用ルール
- `codex/skills`: Codex 運用 Skill
- `scripts/codex`: 運用スクリプト
- `docs/architecture`: 運用補助ドキュメント
- `tasks`: 作業計画と教訓
