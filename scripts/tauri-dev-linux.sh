#!/usr/bin/env bash
# Tauri dev on Linux (Nobara/Fedora) — avoids common Wayland/WebKit crashes
set -euo pipefail

cd "$(dirname "$0")/.."

export GDK_BACKEND="${GDK_BACKEND:-x11}"
export WEBKIT_DISABLE_DMABUF_RENDERER="${WEBKIT_DISABLE_DMABUF_RENDERER:-1}"

echo "Starting Tauri dev (GDK_BACKEND=$GDK_BACKEND)..."
exec npm run tauri:dev
