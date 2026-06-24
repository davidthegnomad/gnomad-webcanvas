#!/usr/bin/env bash
# Production macOS bundles (.app + .dmg). Run on macOS only.
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "macOS build must run on a Mac (or CI macos-latest runner)." >&2
  exit 1
fi

TAURI_ARGS=(build --ci --config src-tauri/tauri.macos.conf.json)

if [[ -z "${TAURI_SIGNING_PRIVATE_KEY:-}" ]]; then
  TAURI_ARGS+=(--config '{"bundle":{"createUpdaterArtifacts":false}}')
fi

echo "Building Gnomad Webcanvas for macOS…"
npx tauri "${TAURI_ARGS[@]}"

echo ""
find src-tauri/target/release/bundle -type f \( -name '*.dmg' \) -newer package.json 2>/dev/null || true
find src-tauri/target/release/bundle/macos -name '*.app' -maxdepth 1 2>/dev/null || true
