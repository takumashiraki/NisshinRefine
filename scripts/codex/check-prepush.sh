#!/bin/sh
set -eu

REPO_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
cd "$REPO_ROOT"
BUN_BIN="$(sh "$REPO_ROOT/scripts/codex/resolve-bun.sh")"

echo "[check:prepush] bun run lint"
"$BUN_BIN" run lint

echo "[check:prepush] bun run typecheck"
"$BUN_BIN" run typecheck

echo "[check:prepush] bun run test"
"$BUN_BIN" run test

echo "[check:prepush] bun run check:generated:clean"
"$BUN_BIN" run check:generated:clean
