# Codex 運用ガイド（短縮版）

このドキュメントは新規参加者向けの入口です。正本は `AGENTS.md` と `codex/rules/*` です。

## 最初に読む順番

1. `AGENTS.md`
- リポジトリ全体方針、品質ゲート、Skill の位置づけを確認する

2. `codex/rules/05-execution-primitives.md`
- 依頼内容をどこに反映すべきかを判断する

3. 必要な領域ルール
- `codex/rules/01-core-workflow.md`
- `codex/rules/02-backend-hono-d1.md`
- `codex/rules/03-frontend-api-contract.md`
- `codex/rules/04-quality-gates.md`
- `codex/rules/06-cloudflare-mcp.md`

## 迷ったときの判断

- 方針を変える: `AGENTS.md`
- 領域ルールを変える: `codex/rules/*.md`
- 自動強制したい: `.githooks/*` + `scripts/codex/check-*.sh`
- 再利用手順を追加したい: `codex/skills/*`
- 単発作業を追加したい: `scripts/codex/*.sh`
- Cloudflare/MCP 運用を更新したい: `codex/rules/06-cloudflare-mcp.md` + `scripts/codex/setup-mcp.sh`
- 記事系 Skills の分類・採用判断をしたい: `docs/architecture/skill-classification-guide.md`

記事系 Skills 判定は `docs/architecture/skill-classification-guide.md` を使い、最終的な反映先は `codex/rules/05-execution-primitives.md` で確定する。

## このリポジトリの方針

- Codex 専用運用を正本とする
- `CLAUDE.md` / slash command / Claude sub-agent は比較対象としてのみ扱う
- 生成物は手編集せず、既存の生成フローで更新する
- Cloudflare 系 Skill はリポジトリ管理の同名 Skill で置換し、`bun run skills:sync` で同期する
