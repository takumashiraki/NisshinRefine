# 実行プリミティブ選定ルール

## 目的

変更依頼を受けたときに、どの運用プリミティブへ実装・記述するかを一意に判断できる状態を作る。

## 対象範囲

- 対象: Codex 運用 (`AGENTS.md`, `codex/rules/*`, `.githooks/*`, `scripts/codex/*`, `codex/skills/*`)
- 対象に含む設定: `~/.codex/config.toml` の MCP サーバー設定（リポジトリからは `scripts/codex/setup-mcp.sh` で反映）
- 非対象: Claude 固有運用 (`CLAUDE.md`, slash command, Claude sub-agent の常用)

## プリミティブの役割

- 長期不変の規範: `AGENTS.md`
- ルーティング規則の正本: `codex/rules/07-dynamic-routing.md`
- 実装領域別の具体ルール: `codex/rules/*.md`
- 自動品質ゲート: `.githooks/*` + `scripts/codex/check-*.sh`
- タスク別実行手順の再利用: `codex/skills/*`
- 手動オペレーションの実行単位: `scripts/codex/*.sh`
- MCP 接続前提の知識取得: `codex/skills/cloudflare*` と `scripts/codex/setup-mcp.sh`

## 選定フロー

0. 依頼をルーティングする
- `07-dynamic-routing.md` の判定テーブルで、依頼タイプと対象パスを確定する
- 複合要求の場合は `$codex-orchestration` を起点に分割する

1. 変更の性質を判定する
- 規範か、実行手順か、自動検証か、単発作業かを決める

2. 再利用性を判定する
- 複数タスクで再利用するなら `codex/skills/*`
- その場限りなら `scripts/codex/*.sh` または作業メモに留める

3. 強制度を判定する
- Must: `AGENTS.md` / `codex/rules/*` / `.githooks/*`
- Should: `codex/skills/*`
- Could: `docs/*` (運用補助)

4. 配置先を確定する
- 既存ファイルで表現できる場合は最小差分で更新
- 新規作成が必要な場合は責務が重複しない配置先を選ぶ

## 判定テーブル

| 変更したい内容 | 反映先 | 使わないこと | 担当 | レビュータイミング |
|---|---|---|---|---|
| 複合要求を分割し、並列調査の手順を定義したい | `codex/skills/codex-orchestration` + `codex/rules/07-dynamic-routing.md` | 実装手順を `AGENTS.md` に肥大化させる | リポジトリメンテナー | 複合要求発生時 |
| リポジトリ全体の方針を追加・変更したい | `AGENTS.md` | `codex/skills/*` に方針だけを書く | リポジトリメンテナー | 方針変更時/四半期 |
| バックエンド / フロントエンド / 品質 など領域別ルールを追加したい | `codex/rules/0x-*.md` | `AGENTS.md` に詳細実装手順を肥大化させる | ドメインメンテナー | 該当領域変更時 |
| 毎回自動で強制したい品質チェックを追加したい | `.githooks/*` + `scripts/codex/check-*.sh` + `04-quality-gates.md` | 手動手順のみで運用する | リポジトリメンテナー | CI/hook 変更時 |
| 繰り返し使う作業フローを追加したい | `codex/skills/*` (+ `agents/openai.yaml`) | 単発タスクを Skill 化する | 機能オーナー | 新フロー導入時 |
| 単発作業や保守用コマンドを追加したい | `scripts/codex/*.sh` | hooks に単発処理を埋め込む | タスクオーナー | 必要時 |
| MCP サーバー設定を導入・更新したい | `scripts/codex/setup-mcp.sh` + `AGENTS.md` + `codex/rules/06-cloudflare-mcp.md` | 手作業だけで環境差分を放置する | リポジトリメンテナー | MCP 追加/更新時 |
| 新規参加者向けの要約を提供したい | `docs/*` | ルール正本を docs のみに置く | リポジトリメンテナー | オンボーディング更新時 |

## 依頼内容と反映先の対応

- 方針追加依頼 -> `AGENTS.md`
- 依頼ルーティング最適化 -> `codex/rules/07-dynamic-routing.md` + `codex/skills/codex-orchestration`
- バックエンド設計ルール追加依頼 -> `codex/rules/02-backend-hono-d1.md`
- API 契約変更フロー追加依頼 -> `codex/skills/api-contract-flow` + `codex/rules/03-frontend-api-contract.md`
- 品質チェック強化依頼 -> `.githooks/*` + `scripts/codex/check-*.sh` + `codex/rules/04-quality-gates.md`
- Cloudflare 技術導入依頼 -> `codex/skills/cloudflare*` + `codex/rules/06-cloudflare-mcp.md`
- MCP 利用開始依頼 -> `scripts/codex/setup-mcp.sh` + `AGENTS.md` + `codex/rules/06-cloudflare-mcp.md`

## 外部 Skill カテゴリ参照

- 外部記事ベースの Skill カテゴリ採用判断は `docs/architecture/skill-classification-guide.md` を参照する
- ただし規範の正本は引き続き `AGENTS.md` と `codex/rules/*` とし、`docs/*` は運用補助として扱う

## 非採用機能（比較用）

- `CLAUDE.md`: このリポジトリでは正本にしない
- slash command: 未採用。代替は `scripts/codex/*.sh` + `codex/skills/*`
- Claude sub-agent: 未採用。代替は `codex/skills/*/agents/openai.yaml`
