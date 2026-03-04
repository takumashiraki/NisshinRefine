# Spec and Flow Reference

## Spec の正本

- `packages/validation/specs/user.spec.json`
- `packages/validation/specs/status.spec.json`

## 生成コマンド

```bash
bun run generate:contracts
bun run generate:openapi
bun run generate:api-types
```

一括:

```bash
bun run generate:all
```

## 冪等性

```bash
bun run check:idempotent
```

## 現在のレイヤ

- DB: `packages/validation/src/db/*` -> `src/generated/db/*`
- Contract: `packages/validation/src/contract/*` -> `src/generated/contract/*`
- OpenAPI: `packages/validation/src/openapi/*` -> `src/generated/openapi/*`

## backend 参照ポイント

- route: `apps/backend/src/schemas/*`
- infra: `apps/backend/src/infrastructure/*`
- usecase: `apps/backend/src/usecase/*`

## 生成物（手編集禁止）

- `packages/validation/src/generated/**`
- `packages/api-types/openapi/status.openapi.json`
- `packages/api-types/src/generated/**`
- `apps/frontend/src/features/status/api/generated/**`
