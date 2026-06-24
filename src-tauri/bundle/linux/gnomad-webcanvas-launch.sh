#!/bin/sh
export GDK_BACKEND=x11
export WEBKIT_DISABLE_DMABUF_RENDERER=1
exec /usr/bin/gnomad-webcanvas "$@"
