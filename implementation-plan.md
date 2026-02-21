## NisshinRefine ベース実装計画

`arch.md` で定義したアーキテクチャを前提に、このリポジトリの「ベース実装」を段階的に進めるための計画をまとめる。
当面は **土台づくり（ビルド・デプロイ・型共有・最小ユースケース）** をゴールにする。

---

## フェーズ 0: リポジトリ基盤

- **0-1: Monorepo 構成の作成**
  - `apps/frontend`
    - AI Agent( agent teams )複数並列で実行するため、 pacakege by feature と atomic Design で実装
  - `apps/backend`
    - AI Agent( agent teams )複数並列で実行するため、 クリーンアーキテクチャ 兼 pacakege by feature で実装
  - `apps/docs`
  - `packages/api-types`
  - `packages/validation`
  - `packages/ui`
- **0-2: パッケージマネージャ・ツールチェーン**
  - Bun を前提に `package.json` / `bunfig.toml`（または相当の設定）を整備
  - `turbo` もしくは `biome` / `oxlint` などのモノレポ・Lint ツール検討（必要なら）
- **0-3: 共通設定**
  - TypeScript 共通 `tsconfig.base.json`
  - Lint（`oxlint`）とフォーマッタ設定
  - Editor 設定（`./.vscode` or `./.cursor`）※任意

---

## フェーズ 1: 型とスキーマの土台

- **1-1: ドメイン / API / OpenAPI スキーマ分離**
  - `packages/validation` 内に以下の構成を作成
    - `domain/schema.ts`（ビジネスルール）
    - `api/schema.ts`（DTO）
    - `openapi/schema.ts`（OpenAPI 用）
- **1-2: Zod + Result 型**
  - `Result<T, E>` 型を共通利用できるよう `packages/validation` で定義
  - `z.input` / `z.output` の使い分けルールをコメントで明文化
- **1-3: 共通エラー型**
  - `ApiError` スキーマ（`code`, `message`）を定義
  - 全 API で利用する方針を決める

---

## フェーズ 2: Backend ベース実装（Workers / Hono）

- **2-1: Backend プロジェクト雛形**
  - `apps/backend` に Bun + Hono の最小構成を作成
  - `@hono/zod-openapi` による OpenAPI 定義生成の土台
- **2-2: D1 / Drizzle セットアップ**
  - Cloudflare D1 用の Drizzle 設定
  - マイグレーション用スクリプトの雛形
- **2-3: 最小ユースケースの API**
  - 例）ユーザー作成 or 「ステータス取得」API を 1 本
  - `Result 型 + ApiError` を使ったレスポンス構造
- **2-4: OpenAPI 生成と orval 連携**
  - OpenAPI スキーマを出力
  - `packages/api-types` に orval で型 / クライアント関数を生成

---

## フェーズ 3: Frontend ベース実装（Vike + shadcn/ui）

- **3-1: Vike + Bun + Cloudflare Pages 最小セットアップ**
  - `apps/frontend` に Vike プロジェクトを作成
  - Cloudflare Pages へのビルド・デプロイ設定（簡易でよい）
- **3-2: ディレクトリ構成**
  - package-by-feature をベースに layer を意識した構成
    - 例：`features/status`, `features/auth`, `shared/ui`, `shared/lib` など
- **3-3: TanStack Query + orval クライアント**
  - `packages/api-types` 由来のクライアントを使った API 通信フロー
  - シンプルな「ステータス表示」ページを 1 画面
- **3-4: UI コンポーネント**
  - shadcn/ui の導入
  - ベースレイアウトと共通レイアウトコンポーネント（ヘッダー/フッター程度）
- React Hook Form を使う

---

## フェーズ 4: インフラ / AI 統合の土台

- **4-1: Cloudflare Workers / Pages / D1 / R2 の設定**
  - 各環境の `wrangler.toml` 等の設定ファイルを雛形レベルで用意
- **4-2: Workers AI の疎通確認**
  - シンプルなテキスト生成（例：テスト用プロンプト）API を 1 本
  - Backend から Workers AI 呼び出し、Frontend で結果表示
  - https://github.com/cloudflare/agents
- **4-3: 画像系（R2）土台**
  - 画像アップロード / ダミー保存の API 雛形
  - 実際の Leonardo.ai 連携は後フェーズに回す

---

## フェーズ 5: ゲーミフィケーション最小ループ

- **5-1: ステータスの定量的マッピング（最小版）**
  - Strength など全てはやらず、まず 1〜2 軸から着手
  - 例：筋トレ記録 → Strength ステータス更新
- **5-2: デイリークエストの雛形**
  - Workers AI で「今日のクエスト」を 1 件生成するだけのシンプル版
  - TTS やランク管理は後回し
- **5-3: ランク / 称号の最初の実装**
  - E〜SSS まで全定義はせず、E〜C くらいの少数から開始
  - 称号も固定テキストでよい（画像生成は後フェーズ）

---

## フェーズ 6: テスト / 品質強化

- **6-1: Backend E2E（scenarigo）**
  - API 1〜2 本に対して scenarigo で E2E テストを用意
- **6-2: Frontend E2E（Playwright）**
  - ステータス表示ページ or クエスト表示ページの E2E
- **6-3: 型・Lint ルールの固定化**
  - `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` の有効化
  - oxlint を CI で実行するワークフローの草案

---

## 実行順の目安

1. フェーズ 0 → 1 までで「型とモノレポ構成」の土台を固める
2. フェーズ 2 → 3 で「Backend/Frontend それぞれの最小ユースケース」を繋ぐ
3. フェーズ 4 で Workers / D1 / Workers AI との疎通を確認
4. フェーズ 5 でゲーミフィケーションの最小ループを実装
5. フェーズ 6 でテストと品質を底上げ

以降、詳細な機能（TTS、アバター生成、マルチモーダル RAG 等）は、上記フェーズをベースに個別の設計・実装タスクとして切り出していく。

