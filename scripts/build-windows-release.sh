#!/usr/bin/env bash
# Production Windows NSIS installer (Windows Alpha channel).
set -euo pipefail

cd "$(dirname "$0")/.."

TAURI_ARGS=(build --ci --config src-tauri/tauri.windows.conf.json)

if [[ -z "${TAURI_SIGNING_PRIVATE_KEY:-}" ]]; then
  TAURI_ARGS+=(--config '{"bundle":{"createUpdaterArtifacts":false}}')
fi

echo "Building Gnomad Webcanvas for Windows (NSIS)…"
npx tauri "${TAURI_ARGS[@]}"

echo ""
echo "Installers:"
find src-tauri/target/release/bundle/nsis -type f -name '*.exe' 2>/dev/null | sort || true
