# Skills 分類・運用プリミティブ判定ガイド

このドキュメントは、外部記事で紹介される Skills 分類と、NisshinRefine の運用プリミティブを接続するための補助資料です。正本は `AGENTS.md` と `codex/rules/*` です。

参考: [個人開発がチート級に加速する！おすすめSkills](https://zenn.dev/imohuke/articles/claude-code-mcp-skills-summary)

## 目的

- Codex にドキュメント追加・運用変更を依頼するとき、反映先と Skill カテゴリを一意に判断する
- 反映先 (`AGENTS.md` / `codex/rules/*` / `codex/skills/*` / `scripts/codex/*` / `docs/*`) と Skill 系統を同時に決める
- 用途判定と同格で安全性チェック（出所・権限・再現性）を必須化する

## 判定フロー

### 第1段階: リポジトリ反映先を決める（実行プリミティブ判定）

1. 変更が規範か、領域ルールか、再利用フローか、単発作業かを判定する
2. `codex/rules/05-execution-primitives.md` の判定テーブルで反映先を確定する
3. `docs/*` は補助用途に限定し、規範を昇格させない

### 第2段階: Skill カテゴリを決める（8カテゴリ判定）

1. 依頼意図を 8 カテゴリのいずれか 1 つに割り当てる
2. このリポジトリでの推奨度（高/中/低）を確認する
3. 対応する既存 Skill/ルールと非推奨ケースを確認する

## 8カテゴリ一覧

| Skill カテゴリ | 推奨度 | このリポジトリでの主な適用シーン | 対応する既存 Skill/ルール | 非推奨ケース |
|---|---|---|---|---|
| コード品質と Lint (Code quality and linting) | 高 | PR 前の品質確認、生成物同期の確認、lint/typecheck/test 実行 | `codex/skills/release-gate-check`、`codex/rules/04-quality-gates.md` | 単発の体裁修正だけを恒久ルールとして追加する |
| バグ検出と分析 (bug detection and analysis) | 高 | 挙動差分の原因調査、エラー契約整合性の確認、回帰影響の洗い出し | `codex/skills/release-gate-check`、`codex/rules/01-core-workflow.md` | 再現条件なしで推測だけで修正方針を確定する |
| 依存管理と更新 (dependency management and updates) | 中 | 依存更新時の影響整理、生成物再生成、品質ゲート再実行 | `codex/rules/04-quality-gates.md`、`codex/rules/01-core-workflow.md` | lockfile/生成物を手編集して差分を作る |
| セキュリティと脆弱性スキャン (security and vulnerability scanning) | 中 | 依存更新や CI 変更時の安全性確認、破壊的操作の事前チェック | `codex/rules/04-quality-gates.md`、`codex/rules/05-execution-primitives.md` | 権限要件不明のまま外部ツールを常用化する |
| ドキュメントと知識管理 (documentation and knowledge management) | 高 | 運用ガイド整備、オンボーディング文書更新、判定基準の明文化 | `docs/architecture/*`、`codex/rules/05-execution-primitives.md` | docs のみ更新して正本（AGENTS/rules）との整合を確認しない |
| DevOps と CI/CD ワークフロー (DevOps and CI/CD workflows) | 中 | CI ジョブやフック運用の見直し、品質ゲートの強制運用設計 | `.githooks/*`、`scripts/codex/check-*.sh`、`codex/rules/04-quality-gates.md` | 単発運用コマンドを CI/hook に直接埋め込む |
| ターミナルとコマンドライン生産性 (terminal and command-line productivity) | 中 | 日常運用の反復作業を `scripts/codex/*.sh` として整理する | `scripts/codex/*.sh`、`codex/rules/05-execution-primitives.md` | 一度きりの手作業を汎用スクリプトとして残す |
| AI コーディングアシスタント (AI-powered coding assistants) | 高 | Codex 運用ルール整備、Skill 適用範囲の定義、実装依頼の標準化 | `AGENTS.md`、`codex/rules/*`、`codex/skills/*` | エージェント固有機能をこのリポジトリの正本として扱う |

## リポジトリ反映先マッピング

判定マトリクスは以下の列で固定する。

| 依頼意図 | リポジトリ反映先 | Skill カテゴリ | 推奨度 | 安全性チェック結果 | 実行アクション |
|---|---|---|---|---|---|
| 依頼内容を記入 | `AGENTS.md` / `codex/rules/*` / `codex/skills/*` / `scripts/codex/*` / `docs/*` | 8カテゴリのいずれか1つ | 高 / 中 / 低 | 通過 / 採用保留 | 実施コマンド・更新ファイルを記入 |

## 安全性ゲート

以下 3 項目は必須。1つでも未記入または不明なら「採用保留」とする。

1. 出所確認
- 公式ドキュメントまたは信頼ソースを明示できるか

2. 権限確認
- 必要最小権限か、破壊的操作（削除・強制上書き）が含まれないか

3. 再現性確認
- 実行コマンド、期待結果、ロールバック手順を示せるか

## 依頼テンプレート

```md
## 依頼
- 依頼意図:
- 背景:

## 分類
- リポジトリ反映先:
- Skill カテゴリ:
- 推奨度:

## 安全性ゲート
- 出所確認:
- 権限確認:
- 再現性確認:
- 安全性チェック結果: 通過 / 採用保留

## 実行アクション
- 実行アクション:
- 変更対象ファイル:
```

## 具体例（代表10ケース）

| 依頼意図 | リポジトリ反映先 | Skill カテゴリ | 推奨度 | 安全性チェック結果 | 実行アクション |
|---|---|---|---|---|---|
| API 契約を変更したい | `codex/skills/api-contract-flow` + `codex/rules/03-frontend-api-contract.md` | ドキュメントと知識管理 | 高 | 通過 | schema 更新 -> OpenAPI 再出力 -> Orval 再生成 -> generated 差分コミット |
| D1 クエリ仕様を変更したい | `codex/skills/d1-change-flow` + `codex/rules/02-backend-hono-d1.md` | バグ検出と分析 | 高 | 通過 | infrastructure/usecase 更新、`db.batch` 利用、失敗系確認 |
| PR 前に品質確認したい | `codex/skills/release-gate-check` + `codex/rules/04-quality-gates.md` | コード品質と Lint | 高 | 通過 | lint/typecheck/test/check:generated:clean 実行 |
| 単発の保守コマンドを追加したい | `scripts/codex/*.sh` | ターミナルとコマンドライン生産性 | 中 | 通過 | スクリプト追加、用途と実行方法を記述 |
| 新規参加者向けの説明を追加したい | `docs/architecture/*` | ドキュメントと知識管理 | 高 | 通過 | 要約ガイド追加、正本リンクを明記 |
| 依存パッケージを更新したい | `codex/rules/04-quality-gates.md` 準拠で関連設定更新 | 依存管理と更新 | 中 | 通過 | 依存更新、生成物再生成、品質ゲート再実行 |
| CI の品質ゲートを強化したい | `.githooks/*` + `scripts/codex/check-*.sh` + `codex/rules/04-quality-gates.md` | DevOps と CI/CD ワークフロー | 中 | 通過 | hook/CI 設定を追加し手順を更新 |
| セキュリティスキャン導入を検討したい | `codex/rules/04-quality-gates.md` + `docs/architecture/*` | セキュリティと脆弱性スキャン | 中 | 採用保留 | 公式出所・最小権限・ロールバック定義後に再判定 |
| Codex 向け運用方針を変更したい | `AGENTS.md` | AI コーディングアシスタント | 高 | 通過 | 方針更新、関連 rules/docs の整合確認 |
| 既存不具合の再現調査を行いたい | `codex/rules/01-core-workflow.md` + 必要に応じて `codex/skills/release-gate-check` | バグ検出と分析 | 高 | 通過 | 再現手順固定、影響範囲整理、検証コマンド記録 |
