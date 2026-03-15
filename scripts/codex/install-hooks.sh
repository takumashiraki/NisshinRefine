#!/bin/sh
set -eu

REPO_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
cd "$REPO_ROOT"

HOOK_PATH=".githooks"
MODE="install"
FORCE=0

for arg in "$@"; do
  case "$arg" in
    --verify)
      MODE="verify"
      ;;
    --force)
      FORCE=1
      ;;
    *)
      echo "Unknown argument: $arg"
      echo "Usage: sh scripts/codex/install-hooks.sh [--verify] [--force]"
      exit 1
      ;;
  esac
done

CURRENT="$(git config --get core.hooksPath || true)"

if [ "$MODE" = "verify" ]; then
  if [ "$CURRENT" = "$HOOK_PATH" ]; then
    echo "core.hooksPath is configured: $HOOK_PATH"
    exit 0
  fi

  echo "core.hooksPath is not configured for this repo."
  if [ -n "$CURRENT" ]; then
    echo "Current value: $CURRENT"
  else
    echo "Current value: (unset)"
  fi
  echo "Run: bun run hooks:install"
  exit 1
fi

if [ -n "$CURRENT" ] && [ "$CURRENT" != "$HOOK_PATH" ]; then
  echo "Detected existing core.hooksPath: $CURRENT"

  if [ "$FORCE" -ne 1 ]; then
    if [ -t 0 ]; then
      printf "Overwrite core.hooksPath to %s ? [y/N]: " "$HOOK_PATH"
      read -r answer
      case "$answer" in
        y|Y|yes|YES)
          ;;
        *)
          echo "Canceled."
          exit 1
          ;;
      esac
    else
      echo "Use --force to overwrite in non-interactive mode."
      exit 1
    fi
  fi
fi

git config core.hooksPath "$HOOK_PATH"
chmod +x .githooks/pre-commit .githooks/pre-push scripts/codex/*.sh

echo "Configured core.hooksPath=$HOOK_PATH"
echo "Verify with: bun run hooks:verify"
