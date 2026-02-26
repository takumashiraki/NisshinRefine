# タスク

- [x] Cloudflare Skill 置換方針を定義する
- [x] `codex/skills` に Cloudflare 系 Skill を Codex 向けで追加する
- [x] 各 Skill に `agents/openai.yaml` を追加する
- [x] MCP セットアップ用スクリプトを追加する
- [x] `package.json` に MCP/Skill 運用スクリプトを追加する
- [x] `AGENTS.md` を Cloudflare Skill + MCP 運用へ更新する
- [x] `codex/rules` と `docs/architecture` を同期更新する
- [x] 検証コマンドを実行する

## レビュー

- 実行コマンド:
  - `sh -n scripts/codex/setup-mcp.sh`
  - `sh -n scripts/codex/sync-skills.sh`
  - `bun run mcp:verify`
  - `bun run lint`
  - `bun run skills:sync`
- 結果:
  - `mcp:verify` は `~/.codex/config.toml` の `mcp_servers.context7` を検出
  - `skills:sync` で Cloudflare 系 Skill を含む 8 Skill を `~/.codex/skills` へ同期
  - lint は既存 `apps/frontend/next-env.d.ts` の warning 1件のみ、error 0件
