# タスク

## Codex最適化ルール再編（AGENTS / Rules / Skills / 疑似マルチエージェント）

- [x] `AGENTS.md` をルーティング中心の構成へ再編する
- [x] `codex/rules/01-core-workflow.md` に Dynamic Routing と疑似マルチエージェント手順を追加する
- [x] `codex/rules/05-execution-primitives.md` を新ルーティング方針へ同期する
- [x] `codex/rules/07-dynamic-routing.md` を新規作成する
- [x] `codex/rules/api-communication-rules.md` を互換参照専用に維持する
- [x] 既存 Skill の `SKILL.md` を 5 要素（発火条件/入力前提/実行ステップ/検証コマンド/出力契約）へ統一する
- [x] 既存 Skill の `agents/openai.yaml` を `SKILL.md` と意味同期する
- [x] `codex/skills/codex-orchestration` を新規追加する
- [x] `tasks/lessons.md` に今回の教訓を追記する
- [x] `~/.codex/AGENTS.md` をグローバル最小契約へ再編する
- [x] 検証コマンドを実行しレビューを更新する

## レビュー

- 実行コマンド:
  - `bun run lint`
  - `bun run skills:sync`
- 結果:
  - `lint` は既存 `apps/frontend/next-env.d.ts` の warning 1 件、error 0 件
  - `skills:sync` で新規 `codex-orchestration` を含む 9 Skill を `~/.codex/skills` へ同期
  - `~/.codex/AGENTS.md` を Codex 向けグローバル最小契約へ更新

## README整備（Root / Backend / Frontend）

- [x] 既存構成と実行コマンドを確認し、README記載項目を確定する
- [x] Root README を作成する（概要、構成図、起動手順、Agentドキュメント、pre-commit）
- [x] Backend README を作成する（必要バージョン、起動手順、DB確認手順）
- [x] Frontend README を作成する（必要バージョン、起動手順）
- [x] 関連コマンドで内容を検証し、レビュー結果を記録する

## レビュー（README整備）

- 実行コマンド:
  - `bun run hooks:verify`
  - `bun run lint`
- 結果:
  - `hooks:verify` は `core.hooksPath=.githooks` で正常
  - `lint` は既存 `apps/frontend/next-env.d.ts` に warning 1 件、error 0 件
