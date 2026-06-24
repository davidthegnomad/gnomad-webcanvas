# Shipping Windows Alpha — Security hardening and platform split

**Date:** 2026-06-24  
**Version:** `v0.1.0-alpha.1` (Windows only)  
**Linux / macOS:** remain on **`v0.1.0-beta.6`**

---

Today we cut the first **Windows Alpha** for Gnomad Webcanvas — a separate channel from the Linux and macOS **beta** builds you may already be running. We have not done much hands-on Windows QA yet, so we're calling this **alpha** and keeping beta releases for the platforms we ship daily.

## Why a separate Windows channel?

Linux Beta 6 has been our daily driver on Fedora/Nobara. Windows needs its own bundle config (NSIS, WebView2 bootstrapper, file associations) and its own path-security rules. Rather than risk breaking Linux/macOS installers, we:

1. Split Tauri config into **platform overlays** (`tauri.linux.conf.json`, `tauri.macos.conf.json`, `tauri.windows.conf.json`)
2. Split CI so **`v*-alpha*` tags build Windows only**; **`v*-beta*` tags still build Linux + macOS**
3. Pinned Linux/macOS artifact version to **beta.6** in their configs while Windows ships **alpha.1**

## What we did today

### AI-assisted code review

We ran parallel reviews with **GLM 5.1**, **Kimi K2.6**, and **Qwen3.5 122B** (all via NVIDIA NIM), then implemented their consensus **P0** fixes:

- **Path guard** — cross-platform `path_guard.rs` using the `dirs` crate; component-wise checks on Windows (fixes `USERPROFILE` and prefix-confusion bugs)
- **Guarded IPC** — removed unrestricted Tauri `fs` writes; all file I/O goes through validated Rust commands
- **CSP** — dropped `unsafe-inline` from `script-src` in the desktop shell
- **Async I/O** — file reads/writes run off the main thread
- **Updater** — release tag validation, HTTP timeouts, install completes before user-triggered restart

Reports live in [`reviews/`](../../reviews/) in the repo.

### Platform code layout

```
src-tauri/
  tauri.conf.json          # shared shell
  tauri.windows.conf.json  # NSIS, file associations, alpha version
  tauri.linux.conf.json    # deb/rpm/AppImage, beta.6
  tauri.macos.conf.json    # app/dmg, beta.6
  src/menu/windows.rs      # Windows menu routing
src/platform/windows.ts    # Windows runtime helper
```

See [PLATFORM_SPLIT.md](../PLATFORM_SPLIT.md) for the full map.

## Download

| Platform | Channel | Get it |
|----------|---------|--------|
| **Windows** | Alpha 1 | [GitHub Release v0.1.0-alpha.1](https://github.com/davidthegnomad/gnomad-webcanvas/releases/tag/v0.1.0-alpha.1) · [Get page](https://davidthegnomad.github.io/gnomad-webcanvas/get/) |
| **Linux** | Beta 6 | [v0.1.0-beta.6 release](https://github.com/davidthegnomad/gnomad-webcanvas/releases/tag/v0.1.0-beta.6) |
| **macOS** | Beta 6 | same as Linux |
| **Web** | Always latest | [Play in browser](https://davidthegnomad.github.io/gnomad-webcanvas/app/) |

### Windows Alpha expectations

- NSIS `.exe` installer (WebView2 bootstrapper downloads if needed)
- File associations for `.html`, `.css`, `.js`, `.md`
- **Unsigned** — SmartScreen may warn until we configure code signing
- Please [report bugs](mailto:david@gnomad.studio?subject=Webcanvas%20Windows%20Alpha%20Feedback)

## What's next

- Real-world Windows QA (save/open, associations, updater, multi-monitor)
- Code signing for SmartScreen
- Promote Windows to beta when we're confident — without touching Linux/macOS version pins

---

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙
