# Lessons

## Template
- 問題:
- 原因:
- 再発防止ルール:

## Session Notes
- 問題: `drizzle-zod` を `@hono/zod-openapi` の `z` で直接生成すると `z.int` 未定義で失敗した
- 原因: `createSchemaFactory({ zodInstance: z })` で要求される API が `@hono/zod-openapi` 側と一致しないケースがある
- 再発防止ルール: Contract層は `zod` を使って生成し、OpenAPI層で `@hono/zod-openapi` によるメタデータ付与と contract 検証を行う
- 問題: OpenAPI層が Contract層の field API に依存しすぎると生成互換が崩れやすい
- 原因: field 単位の `.openapi()` 可用性がライブラリ組み合わせで不安定
- 再発防止ルール: OpenAPI層は明示的な schema を構築し、`safeParse` ベースで Contract と整合性を担保する
- 問題: OpenAPI 層の `withContract` で `contractSchema.safeParse()` を実行すると `keyValidator._parse is not a function` で 500 が発生した
- 原因: `drizzle-zod` 経由で得た子スキーマが Zod v4 系内部構造（`_zod`）を持ち、Zod v3 互換パーサー（`_parse`）と混在したため
- 再発防止ルール: OpenAPI ルート実行時に Contract の `safeParse` を直接呼ばない。契約連携は生成時の参照関係に限定し、互換検証は別途テストで担保する
