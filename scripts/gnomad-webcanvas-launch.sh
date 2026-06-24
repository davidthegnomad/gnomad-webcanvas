#!/bin/sh
# KDE/Plasma ignores env= in .desktop Exec lines and forces GDK_BACKEND=wayland.
# This wrapper sets X11 WebKit flags before exec (also mirrored in Rust startup).
export GDK_BACKEND=x11
export WEBKIT_DISABLE_DMABUF_RENDERER=1
exec /usr/bin/gnomad-webcanvas "$@"
