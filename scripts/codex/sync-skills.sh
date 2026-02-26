#!/bin/sh
set -eu

REPO_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
SOURCE_DIR="$REPO_ROOT/codex/skills"
CODEX_HOME_DIR="${CODEX_HOME:-$HOME/.codex}"
TARGET_DIR="$CODEX_HOME_DIR/skills"

mkdir -p "$TARGET_DIR"

for skill_dir in "$SOURCE_DIR"/*; do
  [ -d "$skill_dir" ] || continue

  skill_name="$(basename "$skill_dir")"
  target_path="$TARGET_DIR/$skill_name"

  rm -rf "$target_path"
  cp -R "$skill_dir" "$target_path"
  echo "Synced $skill_name -> $target_path"
done

echo "Done."
