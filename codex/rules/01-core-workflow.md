# コアワークフロールール

## 目的

Codex が再現可能で安全な変更を行うための基本ルール。

## ルール

- 変更前に必ず探索する (`rg`, `sed`, `ls` で現状把握)
- 変更は最小差分で行う
- 仕様不明点は実装前に明確化する
- 実装前に `05-execution-primitives.md` で変更先のプリミティブを選定する
- 生成物の直接編集は禁止
- 変更に対応する検証コマンドを実行する

## 標準シーケンス

0. プリミティブ選定 (`codex/rules/05-execution-primitives.md` を参照)
1. 現状確認
2. 影響範囲確認
3. 実装
4. lint/test/typecheck/生成物整合チェック
5. 変更内容を短く要約

## 生成物

以下は直接編集しない:

- `packages/api-types/openapi/status.openapi.json`
- `packages/api-types/src/generated/backend/status.zod.ts`
- `apps/frontend/src/features/status/api/generated/*`
