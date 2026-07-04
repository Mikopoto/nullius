#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-run}"
APP_NAME="Nullius"
PROCESS_NAME="nullius"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_BUNDLE="$ROOT_DIR/apps/desktop/src-tauri/target/release/bundle/macos/Nullius.app"
SERVER_PORT="8787"
SERVER_LOG="$ROOT_DIR/.nullius-server.log"

cd "$ROOT_DIR"

pkill -x "$APP_NAME" >/dev/null 2>&1 || true
pkill -x "$PROCESS_NAME" >/dev/null 2>&1 || true
pkill -f "packages/cli/dist/index.js serve --port $SERVER_PORT" >/dev/null 2>&1 || true

pnpm build
pnpm --filter @nullius/desktop tauri:build

start_server() {
  node packages/cli/dist/index.js serve --port "$SERVER_PORT" >"$SERVER_LOG" 2>&1 &
}

open_app() {
  start_server
  /usr/bin/open -n "$APP_BUNDLE"
}

case "$MODE" in
  run)
    open_app
    ;;
  --debug|debug)
    lldb -- "$APP_BUNDLE/Contents/MacOS/nullius"
    ;;
  --logs|logs)
    open_app
    /usr/bin/log stream --info --style compact --predicate "process == \"$APP_NAME\" || process == \"$PROCESS_NAME\""
    ;;
  --telemetry|telemetry)
    open_app
    /usr/bin/log stream --info --style compact --predicate "process == \"$APP_NAME\" || process == \"$PROCESS_NAME\""
    ;;
  --verify|verify)
    open_app
    sleep 2
    pgrep -x "$APP_NAME" >/dev/null || pgrep -x "$PROCESS_NAME" >/dev/null
    curl -fsS "http://127.0.0.1:$SERVER_PORT/health" >/dev/null
    ;;
  *)
    echo "usage: $0 [run|--debug|--logs|--telemetry|--verify]" >&2
    exit 2
    ;;
esac
