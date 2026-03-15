# 教訓

## 運用・ルーティング

- Cloudflare の外部 Skill をリポジトリ運用へ取り込むときは、`codex/skills` に同名 Skill を置いて `sync-skills.sh` で上書き同期する
- Skill のみ追加して終わらず、`AGENTS.md` / `codex/rules/*` / `docs/architecture/*` を同時更新して選択ルールを固定する
- MCP 設定は `~/.codex/config.toml` を直接手編集前提にせず、冪等スクリプト + verify コマンドで再現可能にする
- `AGENTS.md` は詳細仕様を書かず、`トリガー語 + 対象パス + 依頼タイプ` のルーティングに責務を限定すると保守性が上がる
- Skill の本文は 5 要素テンプレートに統一し、長文詳細は `references/` に退避する方が再利用しやすい
- 複合要求では `Planner -> Investigators(parallel) -> Synthesizer` を固定化すると、探索と実装の境界が崩れにくい

## API契約・生成フロー

- 問題: `drizzle-zod` を `@hono/zod-openapi` の `z` で直接生成すると `z.int` 未定義で失敗した
- 原因: `createSchemaFactory({ zodInstance: z })` で要求される API が `@hono/zod-openapi` 側と一致しないケースがある
- 再発防止ルール: Contract層は `zod` を使って生成し、OpenAPI層で `@hono/zod-openapi` によるメタデータ付与と contract 検証を行う
- 問題: OpenAPI層が Contract層の field API に依存しすぎると生成互換が崩れやすい
- 原因: field 単位の `.openapi()` 可用性がライブラリ組み合わせで不安定
- 再発防止ルール: OpenAPI層は明示的な schema を構築し、`safeParse` ベースで Contract と整合性を担保する
- 問題: OpenAPI 層の `withContract` で `contractSchema.safeParse()` を実行すると `keyValidator._parse is not a function` で 500 が発生した
- 原因: `drizzle-zod` 経由で得た子スキーマが Zod v4 系内部構造（`_zod`）を持ち、Zod v3 互換パーサー（`_parse`）と混在したため
- 再発防止ルール: OpenAPI ルート実行時に Contract の `safeParse` を直接呼ばない。契約連携は生成時の参照関係に限定し、互換検証は別途テストで担保する
- 問題: API リクエスト項目（例: `statusId`）の追加時に、手書き schema だけ更新すると generated と実装の齟齬が起きる
- 原因: `packages/validation/scripts/generate-contracts.ts` と `packages/validation/src/{domain,api}` の複数ソースが契約定義に関与しているため
- 再発防止ルール: API 契約変更時は「generator修正 -> generate:all -> generated差分確認 -> backend usecase反映」を1セットで実施する
- 問題: `mapping_type` のような業務計算ルールが未確定だと、実装修正で手戻りが起きる
- 原因: Issue本体に分岐条件と式がなく、実装時に推測が必要になるため
- 再発防止ルール: 計算仕様は先に専用Issueを起票し、暫定実装には参照Issue番号を残して後続差し替えを追跡可能にする
