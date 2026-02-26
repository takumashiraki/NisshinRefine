# 教訓

- Cloudflare の外部 Skill をリポジトリ運用へ取り込むときは、`codex/skills` に同名 Skill を置いて `sync-skills.sh` で上書き同期する
- Skill のみ追加して終わらず、`AGENTS.md` / `codex/rules/*` / `docs/architecture/*` を同時更新して選択ルールを固定する
- MCP 設定は `~/.codex/config.toml` を直接手編集前提にせず、冪等スクリプト + verify コマンドで再現可能にする
- `AGENTS.md` は詳細仕様を書かず、`トリガー語 + 対象パス + 依頼タイプ` のルーティングに責務を限定すると保守性が上がる
- Skill の本文は 5 要素テンプレートに統一し、長文詳細は `references/` に退避する方が再利用しやすい
- 複合要求では `Planner -> Investigators(parallel) -> Synthesizer` を固定化すると、探索と実装の境界が崩れにくい
