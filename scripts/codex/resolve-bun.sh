#!/bin/sh
set -eu

if command -v bun >/dev/null 2>&1; then
  echo "bun"
  exit 0
fi

if [ -x "$HOME/.bun/bin/bun" ]; then
  echo "$HOME/.bun/bin/bun"
  exit 0
fi

echo "Error: bun が見つかりません。PATH を確認するか https://bun.sh からインストールしてください。" >&2
exit 127
