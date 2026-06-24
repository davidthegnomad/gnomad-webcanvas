#!/usr/bin/env bash
# Print SHA256 checksums for release bundles under src-tauri/target/release/bundle/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUNDLE="$ROOT/src-tauri/target/release/bundle"

if [[ ! -d "$BUNDLE" ]]; then
  echo "No bundle directory at $BUNDLE — run npm run tauri:build first." >&2
  exit 1
fi

find "$BUNDLE" -type f \( \
  -name '*.deb' -o -name '*.rpm' -o -name '*.AppImage' -o -name '*.appimage' \
  -o -name '*.dmg' -o -name '*.exe' -o -name '*.msi' \
\) -print0 | sort -z | xargs -0 sha256sum
