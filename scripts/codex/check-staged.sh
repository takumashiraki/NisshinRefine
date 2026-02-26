#!/bin/sh
set -eu

REPO_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
cd "$REPO_ROOT"
BUN_BIN="$(sh "$REPO_ROOT/scripts/codex/resolve-bun.sh")"

echo "[check:staged] running lint"
"$BUN_BIN" run lint
