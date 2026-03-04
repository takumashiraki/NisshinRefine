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
