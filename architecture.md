# NisshinRefine 日本語名(日新彫琢)

## 概要
ゲーミフィケーションを取り入れて日常生活でレベリングできるアプリケーション

## 元ネタ
俺だけレベルアップ

## サマリー
筋トレが飽きてきたという課題に対し、自身のトレーニング成果をアニメ『俺だけレベルアップな件』のような世界観で視覚化するアプリである。単なる記録ではなく、AIが「システム（管理者）」としてユーザーにクエストを発行し、ランク（E→SSS）を管理する 。   
ゲーミフィケーションのアーキテクチャ
1. ステータスの定量的マッピング:
    * Strength (筋力): 6つの基本コンパウンド種目の重量（対体重比）から算出 。   
    * Intelligence (知力): 技術記事の執筆や読書ログの蓄積量。
    * Agility (敏捷性): 日々のルーチン（家事の自動化完了時間など）の効率性。
    * health: 睡眠時間
2. AIシステムディレクティブ: Workers AIがその日の体調（睡眠時間や前日の活動）を分析し、「デイリークエスト：プッシュアップ20回。報酬：称号『疲労困憊の開拓者』」といった動的な課題を音声（TTS）とテキストで生成する 。   
3. 称号システムと報酬: Leonardo.aiを用いて、現在のランクに応じた「オーラを纏った自分」のアニメ風アバターを生成し、コレクション要素を追加する 。   
QOLへの貢献
筋トレを「義務」から「ゲームの攻略」に変えることで、飽きを防止し、身体的健康を維持する。NisshinRefine

## アプリのアーキテクチャー

### Frontend

* Next.js
* TypeScript
* Better Auth: 認証 「いずれgoogleログインができる」
* OpenAPI
* Bun
* orval
* oxlint
* Playwright: E2Eテスト
* TanStack Query: OpenAPIからhook作成
* [kumo](https://github.com/cloudflare/kumo): UIコンポーネント
* Cloudflare Pages
* [AI SDK](https://github.com/vercel/ai)

### Backend

* Bun
* OpenAPI
* Hono
* Drizzle
* SQLite
* oxlint
* scenarigo: E2Eテスト
* zod: バリデーション
* @hono/zod-openapi: zodから OpenAPIを生成
* orval: OpenAPI から関数生成
* Cloudflare Workers

### DB

アプリのデータは D1 に入れる
Cloudflare Workers 組み込みの D1 

### オブジェクトストレージ

画像の保存に Cloudflare R2 を使う

### AI

* Cloudflare Workers AI
  * https://www.cloudflare.com/ja-jp/developer-platform/products/workers-ai/

#### Cloudflare Workers AIによる実装の技術的整合性

* これらの10の案を支えるのは、Cloudflareのインフラが可能にする「低レイテンシ」と「統合されたデータスタック」である。特に、個人開発において最も重要となるコストと保守性について、Workers AIは理想的な回答を提供している。
* RAGとベクトルデータベースの活用戦略
  * 各アプリで共通して必要となる「個人の記憶（過去のデータ）」の管理は、VectorizeとD1のハイブリッド構成によって実現される 。例えば、キャリアアドバイスにおいては、過去の全コミットメッセージをベクトル化し、現在の悩みに最も関連する「過去の成功体験」をAIが引き出すことで、より説得力のある回答が可能になる。
* マルチモーダル推論の重要性
  * 今回提示した案の多くが「写真撮影」をトリガーとしている。Cloudflareが提供するLlama 3.2 VisionやMistral Small 3.1は、エッジでありながら画像内のテキストだけでなく、物体の関係性や様式を理解できるため、建築物のスタイル判定や冷蔵庫の食材認識、衣服の分類といった複雑なタスクを、重いサーバーを用意することなく実装できる 。   
* セキュリティとプライバシーの担保
  * 資産管理や自宅のデバイス制御を扱うため、CloudflareのZero Trust機能との連携が不可欠である。自分のアプリへのアクセスをCloudflare Accessで制限し、さらにFirewall for AIを使用して、AIモデルへの不正なプロンプトインジェクションを防御することで、個人開発であっても商用レベルの安全性を確保できる 。   

### 型でバグを減らす（t-wada方向）

必須：

* strict true
* noUncheckedIndexedAccess
* exactOptionalPropertyTypes
* branded type
* union制約
* Result型

### 極端な依存をしない

#### 1. Domain Schema と API Schema を分離

今のままだと：

Zod = API = Domain

になりやすい → 将来破綻ポイント

推奨構成

```
/domain/schema.ts        ← ビジネスルール
/api/schema.ts           ← 入出力（DTO）
/openapi/schema.ts       ← OpenAPI用
/usecase/createUser.ts   ← Usecase層
```

理由：

* API変更してもDomain壊れない
* 内部型と外部型を分離できる
* refactorしやすい

##### Frontend

package by feature をベースに package by layer も一部採用する
[package by feature のススメ](https://zenn.dev/pandanoir/articles/d74d317f2b3caf)
featureで切りつつ、layerは意識する

##### Bacend

クリーンアーキテクチャの考え方を参考にした簡易アーキテクチャ
[やさしいクリーンアーキテクチャ](https://zenn.dev/sre_holdings/articles/a57f088e9ca07d)

#### 2. z.input / z.output を使い分ける

Zodは：

```ts
type Input = z.input<typeof schema>
type Output = z.output<typeof schema>
```

→ 変換ロジックがあると型ズレ防止

#### 3. エラー型を共通化（重要）

OpenAPI + orval + E2E を安定させるなら：

```ts
const ApiError = z.object({
  code: z.string(),
  message: z.string(),
})
```

→ 全APIで統一

メリット：

* Frontendが型安全
* E2E書きやすい
* AIが壊しにくい

#### 4. Result型（例外廃止）

```ts
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }
```

## 構成

Monorepo + Modular Monolith

* deploy単位は複数Worker
* repoは1つ
* 型共有
* OpenAPI一元化
* 必要になったら分割

```
~/ghq/github.com/takumashiraki/NisshinRefine
 ├ apps/
 │   ├ frontend (Cloudflare Pages)
 │   ├ backend  (Workers / Hono)
 │   └ docs
 ├ packages/
 │   ├ api-types (orval生成)
 │   ├ validation (zod schema)
 │   └ ui
 ├ docs/
 ├ .claude
```
