# Building Gnomad Webcanvas for macOS, Linux, and Windows

## Prerequisites (all platforms)

- Node.js LTS (22 recommended)
- Rust stable (`rustup`)
- Platform SDKs for the OS you are building **on** (cross-compiling is possible but not covered here)

```bash
cd 05_apps_and_extensions/gnomad-preview
npm install
npm run build
```

[Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/) — install WebView2 (Windows), Xcode CLT (macOS), webkit2gtk 4.1 (Linux).

---

## Development

```bash
# Web only (browser at http://localhost:5173)
npm run dev

# Desktop (Vite + Tauri shell) — Wayland default on modern Linux
npm run tauri:dev

# Linux fallback if WebKit/GPU issues (forces X11)
npm run tauri:dev:x11

# Unit tests (Vitest)
npm run test
npm run test:watch
```

---

## Production build

```bash
npm run tauri:build
# CI variant (same build; signing via env — see .env.example)
npm run tauri:build:ci
```

Output under `src-tauri/target/release/bundle/`:

| Platform | Artifacts |
|----------|-----------|
| **macOS** | `.app`, `.dmg` |
| **Windows** | `.msi`, `.exe` (NSIS) |
| **Linux** | `.deb`, `.rpm`, AppImage |

Checksums after a local build:

```bash
bash scripts/sha256-bundles.sh
```

---

## macOS

```bash
npm run tauri:build
```

Output: `src-tauri/target/release/bundle/macos/Gnomad Webcanvas.app`

- Native File menu (Open / Save / Save As / Quit)
- Window title reflects filename and dirty state
- **Signing / notarization:** optional — configure GitHub secrets in `.env.example` when ready

Minimum macOS version: **10.15** (set in `tauri.conf.json`).

---

## Linux

Install dependencies:

```bash
# Fedora / Nobara
bash scripts/install-linux-deps.sh

# Ubuntu / Debian
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

On **Wayland**, use `npm run tauri:dev`. For WebKit/GPU issues, use `npm run tauri:dev:x11`.

```bash
npm run tauri:build:linux
# or full local prep (deps + npm ci + build):
bash scripts/build-linux-local.sh
```

On **Fedora 43 / Nobara / Arch** and other distros with modern glibc, use `npm run tauri:build:linux` — it sets `NO_STRIP=1` and `APPIMAGE_EXTRACT_AND_RUN=1` so linuxdeploy can bundle AppImages without failing on `.relr.dyn` ELF sections.

Plain `npm run tauri:build` still works for `.deb` and `.rpm`; AppImage may fail unless those env vars are set.

### Do I need a build per Linux kernel?

**No.** One **x86_64** build covers all common desktop distros (Fedora, Nobara, Ubuntu, Debian, Arch, etc.) regardless of kernel version. Ship three Linux formats and users pick what fits:

| Format | Best for |
|--------|----------|
| **`.rpm`** | Fedora, Nobara, RHEL, openSUSE |
| **`.deb`** | Ubuntu, Debian, Pop!\_OS, Mint |
| **AppImage** | Portable / unknown distro (avoid stale extracts in `~/.local/opt/`) |

You only need **separate builds per CPU architecture** (e.g. `x86_64` vs `aarch64`/ARM). Kernel updates on the same machine do not require a new installer.

Launch on Wayland/KDE if the window is blank:

```bash
GDK_BACKEND=x11 WEBKIT_DISABLE_DMABUF_RENDERER=1 gnomad-webcanvas
```

Or use `scripts/launch-linux.sh` after installing the RPM.

On **Wayland**, use `npm run tauri:dev`. For WebKit/GPU issues, use `npm run tauri:dev:x11`.

---

## Windows

Build on Windows with [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (Evergreen bootstrapper in `tauri.conf.json`):

```bash
npm run tauri:build
```

Output: `.msi` and NSIS `.exe`.

**Code signing:** optional — `WINDOWS_CERTIFICATE` secrets in CI (see `.env.example`).

---

## CI release builds

Tagged pushes (`v*`) trigger `.github/workflows/release.yml`:

| Runner | Target |
|--------|--------|
| `macos-latest` | `aarch64-apple-darwin`, `x86_64-apple-darwin` |
| `ubuntu-latest` | `x86_64-unknown-linux-gnu` |
| `windows-latest` | `x86_64-pc-windows-msvc` |

Releases publish automatically as **pre-releases** (`prerelease: true`). Flip to stable in the workflow when ready.

Each matrix job uploads `SHA256SUMS-<target>.txt` artifacts.

See [RELEASE_RUNBOOK.md](RELEASE_RUNBOOK.md).

---

## Verification after build

```bash
npm run lint
npm run test
npx tsc -b --noEmit
npm run build
```

Before tagging: walk [QA_CHECKLIST.md](QA_CHECKLIST.md) on at least one platform.

---

## Cross-platform parity

| Feature | Web | Desktop |
|---------|-----|---------|
| Open/Save file | — | Native dialogs + File menu |
| Recent files | — | File menu (desktop) |
| Project persistence | localStorage | File on disk when saved; localStorage for scratch projects |
| Export ZIP | Browser download | Native save dialog |
| Share URL | ✓ | ✓ |
| System UI theme | — | Optional “System UI” toggle |
| Preview sandbox | Strict default | Strict / Relaxed toggle |

Use [CROSS_PLATFORM_CHECKLIST.md](CROSS_PLATFORM_CHECKLIST.md) when adding OS-facing features.

---

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙
