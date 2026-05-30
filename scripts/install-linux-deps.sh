#!/usr/bin/env bash
# Tauri 2 dev/build dependencies for Fedora, Nobara, RHEL
set -euo pipefail

echo "Installing Tauri Linux dependencies (requires sudo)..."
sudo dnf install -y \
  webkit2gtk4.1-devel \
  javascriptcoregtk4.1-devel \
  libsoup3-devel \
  libappindicator-gtk3-devel \
  librsvg2-devel \
  openssl-devel \
  gtk3-devel \
  pkg-config

echo ""
echo "Done. You can now run:"
echo "  npm run tauri:dev    # desktop dev"
echo "  npm run tauri:build  # desktop release build"
echo ""
echo "Web-only (no Tauri deps needed):"
echo "  npm run dev          # http://localhost:5173"
