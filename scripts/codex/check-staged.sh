#!/bin/sh
set -eu

REPO_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
cd "$REPO_ROOT"

echo "[check:staged] running lint"
bun run lint
