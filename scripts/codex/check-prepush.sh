#!/bin/sh
set -eu

REPO_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
cd "$REPO_ROOT"

echo "[check:prepush] bun run lint"
bun run lint

echo "[check:prepush] bun run typecheck"
bun run typecheck

echo "[check:prepush] bun run test"
bun run test

echo "[check:prepush] bun run check:generated:clean"
bun run check:generated:clean
