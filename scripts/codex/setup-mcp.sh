#!/bin/sh
set -eu

CODEX_HOME_DIR="${CODEX_HOME:-$HOME/.codex}"
CONFIG_FILE="$CODEX_HOME_DIR/config.toml"
MODE="${1:-apply}"

ensure_config_file() {
  mkdir -p "$CODEX_HOME_DIR"
  [ -f "$CONFIG_FILE" ] || : > "$CONFIG_FILE"
}

has_context7_block() {
  grep -q '^\[mcp_servers\.context7\]' "$CONFIG_FILE"
}

has_serena_block() {
  grep -q '^\[mcp_servers\.serena\]' "$CONFIG_FILE"
}

verify_config() {
  ensure_config_file

  missing=""

  if ! has_context7_block; then
    missing="context7"
  fi

  if ! has_serena_block; then
    if [ -n "$missing" ]; then
      missing="$missing, serena"
    else
      missing="serena"
    fi
  fi

  if [ -n "$missing" ]; then
    echo "MCP verification failed: missing servers ($missing) in $CONFIG_FILE"
    exit 1
  fi

  echo "MCP verification passed: context7 and serena are configured in $CONFIG_FILE"
  exit 0
}

apply_config() {
  ensure_config_file

  added=""

  if ! has_context7_block; then
    cat >> "$CONFIG_FILE" <<'EOCFG'

# MCP servers managed by NisshinRefine
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp@latest"]
EOCFG
    added="context7"
  fi

  if ! has_serena_block; then
    cat >> "$CONFIG_FILE" <<'EOCFG'

[mcp_servers.serena]
command = "uvx"
args = ["--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server", "--context", "codex"]
EOCFG
    if [ -n "$added" ]; then
      added="$added, serena"
    else
      added="serena"
    fi
  fi

  if [ -z "$added" ]; then
    echo "MCP setup skipped: context7 and serena already exist in $CONFIG_FILE"
    exit 0
  fi

  echo "MCP setup complete: added $added to $CONFIG_FILE"
  echo "Restart Codex to pick up new MCP servers."
}

case "$MODE" in
  --verify)
    verify_config
    ;;
  apply|"")
    apply_config
    ;;
  *)
    echo "Usage: sh scripts/codex/setup-mcp.sh [--verify]" >&2
    exit 2
    ;;
esac
