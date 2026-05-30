#!/usr/bin/env bash
# Local Linux build for Gnomad Studio Webcanvas (Fedora/Nobara/RHEL)
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Installing build dependencies (requires sudo)..."
sudo dnf install -y webkit2gtk4.1-devel libappindicator-gtk3-devel librsvg2-devel

echo "Installing npm dependencies..."
npm ci

echo "Building desktop app..."
npm run tauri:build

echo ""
echo "Installers written to:"
find src-tauri/target/release/bundle -type f \( -name '*.deb' -o -name '*.AppImage' -o -name '*.rpm' \) 2>/dev/null || true
echo ""
echo "Test install (.deb example):"
echo "  sudo dnf install ./src-tauri/target/release/bundle/deb/*.deb"
echo "Or run AppImage directly:"
echo "  ./src-tauri/target/release/bundle/appimage/*.AppImage"
