#!/usr/bin/env bash
# Local Linux build for Gnomad Studio Webcanvas (Fedora/Nobara/RHEL)
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Installing build dependencies (requires sudo)..."
sudo dnf install -y \
  webkit2gtk4.1-devel \
  javascriptcoregtk4.1-devel \
  libsoup3-devel \
  libappindicator-gtk3-devel \
  librsvg2-devel \
  openssl-devel \
  gtk3-devel \
  pkg-config

echo "Installing npm dependencies..."
npm ci

echo "Building desktop app..."
npm run tauri:build:linux

echo ""
echo "Installers written to:"
find src-tauri/target/release/bundle -type f \( -name '*.deb' -o -name '*.AppImage' -o -name '*.rpm' \) 2>/dev/null || true
echo ""
echo "Test install:"
echo "  Fedora/Nobara: sudo dnf install ./src-tauri/target/release/bundle/rpm/*.rpm"
echo "  Debian/Ubuntu: sudo dpkg -i ./src-tauri/target/release/bundle/deb/*.deb"
echo "  Any distro:    ./src-tauri/target/release/bundle/appimage/*.AppImage"
