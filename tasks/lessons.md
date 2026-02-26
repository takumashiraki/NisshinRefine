# 教訓

- Cloudflare の外部 Skill をリポジトリ運用へ取り込むときは、`codex/skills` に同名 Skill を置いて `sync-skills.sh` で上書き同期する
- Skill のみ追加して終わらず、`AGENTS.md` / `codex/rules/*` / `docs/architecture/*` を同時更新して選択ルールを固定する
- MCP 設定は `~/.codex/config.toml` を直接手編集前提にせず、冪等スクリプト + verify コマンドで再現可能にする
