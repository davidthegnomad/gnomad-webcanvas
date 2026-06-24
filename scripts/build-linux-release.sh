#!/usr/bin/env bash
# Production Linux bundles for Fedora/Nobara and other modern distros.
set -euo pipefail

cd "$(dirname "$0")/.."

export APPIMAGE_EXTRACT_AND_RUN=1
# linuxdeploy ships an old strip that fails on .relr.dyn (Fedora 43+, Arch, etc.)
export NO_STRIP=1

TAURI_ARGS=(build --ci --config src-tauri/tauri.linux.conf.json)

if [[ -z "${TAURI_SIGNING_PRIVATE_KEY:-}" ]]; then
  TAURI_ARGS+=(--config '{"bundle":{"createUpdaterArtifacts":false}}')
fi

echo "Building Gnomad Webcanvas for Linux (deb, rpm, AppImage)…"
npx tauri "${TAURI_ARGS[@]}"

echo ""
echo "Installers:"
find src-tauri/target/release/bundle -type f \( -name '*.deb' -o -name '*.rpm' -o -name '*.AppImage' \) -newer package.json 2>/dev/null | sort || true
echo ""
echo "Install on this machine:"
echo "  sudo dnf install ./src-tauri/target/release/bundle/rpm/Gnomad\\ Webcanvas-*.rpm"
echo "  ./src-tauri/target/release/bundle/appimage/Gnomad\\ Webcanvas_*.AppImage"
