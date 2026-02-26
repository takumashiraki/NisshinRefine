#!/bin/sh
set -eu

REPO_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
cd "$REPO_ROOT"

TARGET_OPENAPI="packages/api-types/openapi/status.openapi.json"
TARGET_ZOD="packages/api-types/src/generated/backend/status.zod.ts"
TARGET_FRONTEND="apps/frontend/src/features/status/api/generated"

echo "[check:generated:clean] regenerating artifacts"
bun run generate:api-types

if ! git diff --quiet -- "$TARGET_OPENAPI" "$TARGET_ZOD" "$TARGET_FRONTEND"; then
  echo "Generated artifacts are not in sync."
  echo "Run: bun run generate:api-types"
  echo "Changed files:"
  git diff --name-only -- "$TARGET_OPENAPI" "$TARGET_ZOD" "$TARGET_FRONTEND"
  exit 1
fi

echo "Generated artifacts are in sync."
