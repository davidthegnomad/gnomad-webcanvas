# Shipping Gnomad Webcanvas on Linux — Beta 6

**June 23, 2026** · [Gnomad Webcanvas](https://davidthegnomad.github.io/gnomad-webcanvas/) · v0.1.0-beta.6

Today we took Gnomad Webcanvas from “works on my MacBook” to **actually usable on Linux** — specifically Fedora/Nobara with Wayland, WebKitGTK, and real desktop installs. This post is the story of what broke, what we fixed, and what shipped.

---

## What is Webcanvas?

**Gnomad Webcanvas** is a live HTML/CSS/JS playground: three Monaco editor panes, instant iframe preview, export to ZIP, and native Open/Save when you run the Tauri desktop shell. Same React codebase in the browser or on the desktop.

If you just want to try it:

- **Browser:** [Play in browser](https://davidthegnomad.github.io/gnomad-webcanvas/app/)
- **Desktop:** [GitHub Releases — v0.1.0-beta.6](https://github.com/davidthegnomad/gnomad-webcanvas/releases/tag/v0.1.0-beta.6)

---

## The mission for today

We had four goals:

1. **Build and install on Linux** (RPM on Nobara/Fedora 43)
2. **Harden the menu bar** — Close, Help, Check for Updates, platform-correct menus
3. **Split macOS and Linux code paths** so each OS gets idiomatic behavior without `#ifdef` soup in one file
4. **Fix everything that broke** when we turned on real desktop security (CSP) and quit handling

We hit all four. Beta 6 is tagged and CI is publishing installers.

---

## Linux build: from crash to RPM

Getting a Tauri + WebKitGTK app running on modern Fedora is… character-building.

### Wayland + WebKit

On Wayland (KDE Plasma), WebKitGTK can show a **blank window** or crash unless you force the X11 backend:

```bash
GDK_BACKEND=x11 WEBKIT_DISABLE_DMABUF_RENDERER=1 gnomad-webcanvas
```

We baked those flags into the desktop launcher and added `scripts/launch-linux.sh` for a one-command start.

### AppImage on Fedora 43

`linuxdeploy` ships an old `strip` binary that chokes on modern ELF `.relr.dyn` sections. Fix:

```bash
export NO_STRIP=1
export APPIMAGE_EXTRACT_AND_RUN=1
npm run tauri:build:linux
```

That script is now the canonical Linux release path (`scripts/build-linux-release.sh`).

### One build, not one per kernel

A common question: *do we need a separate installer for every Linux kernel?*

**No.** Ship **x86_64** builds in three package formats:

| Format | Best for |
|--------|----------|
| `.rpm` | Fedora, Nobara, RHEL |
| `.deb` | Ubuntu, Debian |
| AppImage | Portable / unknown distro |

Kernel updates on the same machine do not require a new download. You only need separate builds per **CPU architecture** (e.g. ARM64 later).

---

## Bug 1: Editors stuck on “Loading editor…”

**Symptom:** HTML, CSS, and JS panes showed “Loading editor…” forever. Preview worked fine.

**Cause:** We added a Content Security Policy for desktop security. Monaco’s default loader pulls from `cdn.jsdelivr.net`. CSP blocked it. `loader.init()` failed silently.

**Fix:** Bundle Monaco from `node_modules` with Vite worker imports (`src/lib/monacoSetup.ts`). Editors load offline, no CDN, CSP-compliant. The Monaco chunk is ~4 MB — acceptable for a desktop code editor.

---

## Bug 2: Quit and Close did nothing

**Symptom:** File → Quit, the window X button, and Ctrl+W appeared to do nothing. Old instances lingered after reinstall.

**Cause:** Rust called `prevent_close()` on every close request (for unsaved-changes prompts), but the frontend called `destroy()` which **does not clear that guard**. The app could never finish exiting.

**Fix:**

- Added a `CloseGate` in Rust and a `finish_close` command
- Frontend calls `finish_close` after save/discard
- `ExitRequested` (Quit menu) routes through the same flow

You can now quit cleanly. If something ever gets stuck: `pkill gnomad-webcanvas`.

---

## Bug 3: “Could not connect to localhost: Connection refused”

**Symptom:** After reinstall, the app showed a connection error to `localhost`.

**Cause:** An **old AppImage extract** from June was still running from `~/.local/opt/gnomad-webcanvas/`. It pointed at the **dev server** (`http://localhost:5173`). Single-instance mode kept focusing that zombie instead of the new RPM.

**Fix:** Kill stale processes, remove the old extract, launch `/usr/bin/gnomad-webcanvas` explicitly. The launch script handles this automatically.

---

## Platform split: one repo, two personalities

macOS and Linux expect different menu bar layouts:

| Platform | Menu structure |
|----------|----------------|
| **macOS** | App menu · File · Edit · Window (Close Window lives here per HIG) |
| **Linux** | File · Edit · Window · Help (About + Check for Updates) |

We split:

- **Rust:** `src-tauri/src/menu/linux.rs`, `macos.rs`
- **Frontend:** `src/platform/`
- **Build configs:** `tauri.linux.conf.json`, `tauri.macos.conf.json`

Documented in [PLATFORM_SPLIT.md](../PLATFORM_SPLIT.md).

---

## Security and quality pass

Alongside the bug fixes:

- **CSP** locked down for Tauri (no arbitrary remote scripts)
- **Path guard** on desktop file reads — blocks `/etc`, requires paths under `$HOME`, `/tmp`, etc.
- **Parallel code reviews** (Qwen, DeepSeek, NIM) with a combined action-items report
- **31 Vitest tests** including update-status helpers

---

## What shipped in v0.1.0-beta.6

- Bundled Monaco (offline editors)
- Reliable Quit/Close on Linux
- Linux/macOS platform split
- Robust File/Help menus with in-app updater
- `scripts/launch-linux.sh` and Linux CI fixes (`NO_STRIP`, RPM in release workflow)
- GitHub Pages site updated with this post

Download: **[Releases — v0.1.0-beta.6](https://github.com/davidthegnomad/gnomad-webcanvas/releases/tag/v0.1.0-beta.6)**

---

## What’s next

- macOS and Windows QA on CI builds
- ARM64 Linux when there’s demand
- Templates, collaboration, and the 1.0 polish pass on [the roadmap](../ROADMAP.md)

If you’re on Fedora/Nobara, install the RPM, run with the X11 env vars if needed, and tell us what breaks. Beta means we’re listening.

---

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙
