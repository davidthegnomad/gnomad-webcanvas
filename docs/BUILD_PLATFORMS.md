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

[Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/) — install WebView2 (Windows), Xcode CLT (macOS), webkit2gtk (Linux).

---

## Development

```bash
# Web only (browser at http://localhost:5173)
npm run dev

# Desktop (Vite + Tauri shell)
npm run tauri:dev

# Unit tests (Vitest — 19 tests)
npm run test
npm run test:watch   # watch mode
```

---

## Production build

```bash
npm run tauri:build
```

Output under `src-tauri/target/release/bundle/`:

| Platform | Artifacts |
|----------|-----------|
| **macOS** | `.app`, `.dmg` |
| **Windows** | `.msi`, `.exe` (NSIS) |
| **Linux** | `.deb`, `.rpm`, AppImage |

Build on the **target OS** for best results. CI (`.github/workflows/release.yml`) builds all three on tagged releases.

---

## macOS

```bash
npm run tauri:build
```

Output: `src-tauri/target/release/bundle/macos/Gnomad Webcanvas.app`

- Window title reflects open filename and dirty state
- Open/Save use native AppKit dialogs
- **Notarization:** Not yet configured in CI — see future `MACOS_NOTARIZATION.md`

---

## Linux

Install dependencies first (Ubuntu/Debian):

```bash
sudo apt-get update
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

Then:

```bash
npm run tauri:build
```

Output under `src-tauri/target/release/bundle/`:

- **`.deb`** — Debian, Ubuntu, Mint
- **`.rpm`** — Fedora, RHEL, openSUSE
- **AppImage** — distro-agnostic

---

## Windows

Build on Windows with [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) runtime installed:

```bash
npm run tauri:build
```

Output: `.msi` and/or NSIS `.exe` under `src-tauri/target/release/bundle/`

---

## CI release builds

Tagged pushes (`v*`) trigger `.github/workflows/release.yml`:

| Runner | Target |
|--------|--------|
| `macos-latest` | `aarch64-apple-darwin` |
| `ubuntu-latest` | `x86_64-unknown-linux-gnu` |
| `windows-latest` | `x86_64-pc-windows-msvc` |

Releases are created as **drafts** — publish manually after QA.

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

The **same React bundle** ships in web and desktop builds. Platform differences:

| Feature | Web | Desktop |
|---------|-----|---------|
| Open/Save file | — | Native dialogs |
| Project persistence | localStorage | File + localStorage |
| Export ZIP | ✓ | ✓ |
| Share URL | ✓ | ✓ |
| Window title dirty state | — | ✓ |

Use [CROSS_PLATFORM_CHECKLIST.md](CROSS_PLATFORM_CHECKLIST.md) when adding OS-facing features.

---

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙
