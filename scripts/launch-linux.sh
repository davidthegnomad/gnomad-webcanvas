#!/usr/bin/env bash
# Launch the RPM-installed build (not a stale AppImage extract).
set -euo pipefail

BIN="/usr/bin/gnomad-webcanvas"
STALE_DIR="${HOME}/.local/opt/gnomad-webcanvas"

if [[ ! -x "${BIN}" ]]; then
  echo "gnomad-webcanvas not installed. Run:" >&2
  echo "  sudo dnf install ./src-tauri/target/release/bundle/rpm/Gnomad\\ Webcanvas-*.rpm" >&2
  exit 1
fi

if pgrep -x gnomad-webcanvas >/dev/null 2>&1; then
  echo "Stopping existing gnomad-webcanvas instance(s)…"
  pkill -x gnomad-webcanvas || true
  sleep 1
fi

if [[ -d "${STALE_DIR}" ]]; then
  stale_bin="${STALE_DIR}/usr/bin/gnomad-webcanvas"
  if [[ -f "${stale_bin}" ]]; then
    echo "Removing stale AppImage extract at ${STALE_DIR} (can cause localhost:5173 errors)."
    rm -rf "${STALE_DIR}"
  fi
fi

export GDK_BACKEND=x11
export WEBKIT_DISABLE_DMABUF_RENDERER=1
exec "${BIN}" "$@"
