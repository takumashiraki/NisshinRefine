# ステータス定量的マッピング機能 要件定義書（MVP）

## 1. 目的とスコープ

- 目的: 活動ログをステータス値（1〜10）へ定量変換し、継続的な可視化に使える状態にする
- 対象: `Strength` `Routine` `Health` をMVP対象とする
- 非対象: ログイン、称号/ランク、画像生成の品質最適化

## 2. 業務ルール（定量マッピング）

## 2.1 ステータス共通ルール

- ステータス表示値は `1〜10` の整数
- 入力は `rawValue`（実測値）を基本とし、API側で `score` に変換する
- `score` は小数を四捨五入し、`1〜10` に clamp する

## 2.2 MVP対象ステータスの変換式

- `Strength`
  - raw定義: `6種目平均重量(kg) / 体重(kg)` の比率
  - score式: `round(rawValue * 4)` を `1..10` に clamp
- `Routine`
  - raw定義: 当日ルーチン達成率（0〜100）
  - score式: `round(rawValue / 10)` を `1..10` に clamp
- `Health`
  - raw定義: 睡眠時間（時間）
  - score式:
    - 7.0〜8.0: 10
    - 6.0〜6.9 or 8.1〜9.0: 8
    - 5.0〜5.9 or 9.1〜10.0: 6
    - それ以外: 3

## 3. 画面設計

## 3.1 Home画面（`/`）

- 目的: 当日時点のステータス可視化
- 表示要素
  - レーダーチャート（activeなステータス軸）
  - 最新更新日時
  - 過去7日推移（折れ線または一覧）
- データ取得API
  - `GET /users/{userId}/status-summary?date=YYYY-MM-DD`
  - `GET /users/{userId}/status-logs?dateFrom=...&dateTo=...`

## 3.2 ステータス定義画面（`/status/metrics`）

- 目的: マッピング対象ステータス軸の管理
- 一覧項目
  - `displayName`, `metricCode`, `mappingType`, `isActive`, `updatedAt`
- 操作
  - 新規作成
  - 編集
  - 削除（論理削除）
- 入力項目
  - `displayName`（必須）
  - `metricCode`（必須、一意）
  - `mappingType`（`formula_fixed` or `manual_1_10`）
  - `unit`（任意）
  - `sortOrder`（任意）
  - `isActive`（必須）

## 3.3 ステータス入力画面（`/status/logs`）

- 目的: 日次の実測値入力とスコア保存
- 入力項目
  - `recordDate`（必須、日付）
  - 各activeメトリクスの `rawValue`（必須）
  - `note`（任意）
- 操作
  - 登録
  - 編集
  - 削除
- 入力時表示
  - `rawValue` 入力に応じた `score` プレビュー
  - バリデーションエラー表示

## 4. DB設計（Cloudflare D1 / SQLite）

## 4.1 テーブル一覧

- `status_metrics`: ステータス軸定義
- `status_logs`: 日次の入力ログ（raw + score）

## 4.2 テーブル定義

### status_metrics

| カラム | 型 | 必須 | 説明 |
|---|---|---|---|
| id | INTEGER PK AUTOINCREMENT | Yes | メトリクスID |
| user_id | TEXT | Yes | ユーザーID |
| metric_code | TEXT | Yes | `strength` などの識別子 |
| display_name | TEXT | Yes | 画面表示名 |
| mapping_type | TEXT | Yes | `formula_fixed` / `manual_1_10` |
| unit | TEXT | No | `kg`, `hour`, `%` など |
| sort_order | INTEGER | Yes | 表示順 |
| is_active | INTEGER | Yes | 1:有効 0:無効 |
| created_at | TEXT | Yes | ISO8601 |
| updated_at | TEXT | Yes | ISO8601 |
| deleted_at | TEXT | No | 論理削除日時 |

制約・INDEX:
- UNIQUE(`user_id`, `metric_code`)
- INDEX(`user_id`, `is_active`, `sort_order`)

### status_logs

| カラム | 型 | 必須 | 説明 |
|---|---|---|---|
| id | INTEGER PK AUTOINCREMENT | Yes | ログID |
| user_id | TEXT | Yes | ユーザーID |
| metric_id | INTEGER | Yes | `status_metrics.id` |
| record_date | TEXT | Yes | 記録日（YYYY-MM-DD） |
| raw_value | REAL | Yes | 実測値 |
| score | INTEGER | Yes | 1〜10 |
| note | TEXT | No | メモ |
| created_at | TEXT | Yes | ISO8601 |
| updated_at | TEXT | Yes | ISO8601 |
| deleted_at | TEXT | No | 論理削除日時 |

制約・INDEX:
- FOREIGN KEY(`metric_id`) REFERENCES `status_metrics`(`id`)
- UNIQUE(`user_id`, `metric_id`, `record_date`)
- INDEX(`user_id`, `record_date`)

## 5. API設計（MVP）

エラー形式は既存方針に合わせる。
- `{"error_code":"Invalid Request","errors":[{"field":"...","message":"..."}]}`

## 5.1 ステータス定義API

## `GET /users/{userId}/status-metrics`
- 用途: メトリクス一覧取得
- 200 Response:
  - `metrics: [{ id, metricCode, displayName, mappingType, unit, sortOrder, isActive, updatedAt }]`

## `POST /users/{userId}/status-metrics`
- 用途: メトリクス作成
- Request:
  - `{ metricCode, displayName, mappingType, unit?, sortOrder?, isActive }`
- 201 Response:
  - `{ id, metricCode, displayName, mappingType, unit, sortOrder, isActive }`
- 409:
  - `metricCode` 重複

## `PUT /users/{userId}/status-metrics/{metricId}`
- 用途: メトリクス更新
- Request:
  - `{ displayName?, mappingType?, unit?, sortOrder?, isActive? }`
- 200 Response:
  - 更新後メトリクス

## `DELETE /users/{userId}/status-metrics/{metricId}`
- 用途: 論理削除
- 200 Response:
  - `{ id, deletedAt }`

## 5.2 ステータスログAPI

## `GET /users/{userId}/status-logs`
- Query:
  - `dateFrom`（必須）, `dateTo`（必須）, `metricCode`（任意）
- 200 Response:
  - `logs: [{ id, metricId, metricCode, recordDate, rawValue, score, note }]`

## `POST /users/{userId}/status-logs`
- 用途: 日次ログ登録（複数軸まとめて登録可能）
- Request:
  - `{ recordDate, items: [{ metricCode, rawValue, note? }] }`
- サーバー処理:
  - `metricCode` から `mappingType` を取得
  - 変換式で `score` 算出
  - `status_logs` へ保存
- 201 Response:
  - `{ recordDate, items: [{ metricCode, rawValue, score }] }`

## `PUT /users/{userId}/status-logs/{logId}`
- 用途: ログ更新
- Request:
  - `{ rawValue, note? }`
- サーバー処理:
  - 再計算して `score` 更新
- 200 Response:
  - `{ id, metricCode, recordDate, rawValue, score, note }`

## `DELETE /users/{userId}/status-logs/{logId}`
- 用途: ログ論理削除
- 200 Response:
  - `{ id, deletedAt }`

## 5.3 可視化API

## `GET /users/{userId}/status-summary`
- Query:
  - `date`（任意、省略時は当日）
- 用途:
  - レーダーチャート向けの最新スコア取得
- 200 Response:
  - `{ date, statuses: [{ metricCode, displayName, score }] }`

## 6. 受け入れ条件（MVP）

- 3軸（`strength` `routine` `health`）を作成・更新・削除できる
- 1日分の `rawValue` 登録で `score` が自動計算される
- Home画面で当日スコアがレーダーチャート表示される
- 過去7日分ログが取得できる
