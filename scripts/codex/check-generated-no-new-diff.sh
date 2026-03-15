#!/bin/sh
set -eu

REPO_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
cd "$REPO_ROOT"
BUN_BIN="$(sh "$REPO_ROOT/scripts/codex/resolve-bun.sh")"

TARGET_OPENAPI="packages/api-types/openapi/status.openapi.json"
TARGET_ZOD="packages/api-types/src/generated/backend/status.zod.ts"
TARGET_FRONTEND="apps/frontend/src/features/status/api/generated"

BEFORE_DIFF_FILE="$(mktemp)"
AFTER_DIFF_FILE="$(mktemp)"

cleanup() {
  rm -f "$BEFORE_DIFF_FILE" "$AFTER_DIFF_FILE"
}
trap cleanup EXIT INT TERM

echo "[check:generated:no-new-diff] snapshot current generated diff"
git diff --binary -- "$TARGET_OPENAPI" "$TARGET_ZOD" "$TARGET_FRONTEND" > "$BEFORE_DIFF_FILE"

echo "[check:generated:no-new-diff] regenerating artifacts"
"$BUN_BIN" run generate:api-types

echo "[check:generated:no-new-diff] snapshot generated diff after regeneration"
git diff --binary -- "$TARGET_OPENAPI" "$TARGET_ZOD" "$TARGET_FRONTEND" > "$AFTER_DIFF_FILE"

if cmp -s "$BEFORE_DIFF_FILE" "$AFTER_DIFF_FILE"; then
  echo "No additional generated diff introduced."
  exit 0
fi

echo "Generated diff changed after regeneration."
echo "Review these files:"
git diff --name-only -- "$TARGET_OPENAPI" "$TARGET_ZOD" "$TARGET_FRONTEND"
exit 1
