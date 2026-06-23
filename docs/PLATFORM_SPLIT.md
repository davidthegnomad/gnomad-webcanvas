# Platform split — Linux vs macOS

Gnomad Preview ships **separate platform builds** with dedicated code paths. Shared React UI; platform logic lives in Rust modules and thin TS helpers.

## Build commands

| Platform | Command | Artifacts |
|----------|---------|-----------|
| **Linux** | `npm run tauri:build:linux` | `.deb`, `.rpm`, AppImage |
| **macOS** | `npm run tauri:build:macos` | `.app`, `.dmg` |
| Dev Linux | `npm run tauri:dev:linux` | X11 WebKit fallback |
| Dev macOS | `npm run tauri:dev:macos` | Native |

## Code layout

```
src-tauri/src/
  menu/
    linux.rs      # File / Edit / Window / Help
    macos.rs      # App / File / Edit / Window (HIG)
  platform/
    linux.rs      # Linux startup hooks
    macos.rs      # Activation policy + dock reopen
  lib.rs          # Shared IPC, file queue, window close

src/platform/
  linux.ts        # Wayland/WebKit dev hints
  macos.ts        # macOS runtime label
  detect.ts       # OS detection from Tauri UA
  index.ts        # initPlatform() at boot

src-tauri/
  tauri.linux.conf.json   # bundle targets: deb, rpm, appimage
  tauri.macos.conf.json   # bundle targets: app, dmg
```

## Linux optimizations

- Dedicated GTK-style menu (Help submenu, Quit in File)
- `NO_STRIP=1` + `APPIMAGE_EXTRACT_AND_RUN=1` in `scripts/build-linux-release.sh`
- Desktop launcher uses `GDK_BACKEND=x11 WEBKIT_DISABLE_DMABUF_RENDERER=1`
- `single-instance` plugin for `.desktop` / CLI file open

## macOS optimizations

- App menu with Services, Hide, standard Quit
- `Bring All to Front` in Window menu
- Dock icon reopen handler (`RunEvent::Reopen`)
- DMG-only bundle config (no Linux artifacts on Mac CI)

## CI guidance

- **ubuntu-latest** → `npm run tauri:build:linux`
- **macos-latest** → `npm run tauri:build:macos`
- Do not run full `tauri:build` on either; use platform scripts.

## Multi-file open (CLI / file manager)

When multiple supported files are passed at startup (or via second instance), Rust emits `webcanvas:pending-files` with the full list. **The frontend currently opens only the first file** — remaining paths are ignored. This is intentional for v0.1; a file-picker or “open all” flow may come later.

Single-file opens use `webcanvas:open-file` directly. Pending paths queued before the window exists are flushed via `take_pending_open_files` on mount.

## Security (P0/P1)

- **CSP** configured in `tauri.conf.json` for the main shell (preview iframe uses its own `sandbox` attribute).
- **`read_text_file_path`** resolves paths via `path_guard.rs` — blocks `/etc`, `/proc`, etc.; allows `$HOME`, `/tmp`, `/mnt`, `/media`.
