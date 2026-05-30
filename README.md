# Gnomad Studio Webcanvas

![Beta](https://img.shields.io/badge/status-public%20beta-amber?style=flat-square)
![Version](https://img.shields.io/badge/version-0.1.0--beta.1-blue?style=flat-square)
![Stack](https://img.shields.io/badge/stack-Tauri%20%2B%20React%20%2B%20Vite-6366f1?style=flat-square)

**Live HTML, CSS & JavaScript editor with instant preview** — in your browser or as a native desktop app.

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙

---

## What is Webcanvas?

Webcanvas is a lightweight creative coding environment. Write HTML, CSS, and JavaScript in a Monaco-powered editor, see changes live in a sandboxed preview, and export or share your work — no backend, no account, no setup for end users.

It ships as:

- **Web app** — runs entirely in the browser (projects saved to localStorage)
- **Desktop app** — Tauri native shell with file open/save, shell associations, and save-on-close

---

## Why we built it

Most “live preview” tools are either browser-only toys or heavy IDEs. We wanted something in between:

- **Instant feedback** — see HTML/CSS/JS changes as you type
- **Zero friction** — open a tab or double-click a file; no project scaffolding required
- **Shareable** — encode a project in the URL hash or export a ZIP
- **Cross-platform** — one codebase, web + Linux + Windows + macOS
- **Offline-capable** — desktop builds work without a network connection

Webcanvas is part of the [Gnomad Studio](https://gnomadstudio.org) toolset for designers and developers who prototype fast.

---

## Try it (no install)

| | Link |
|---|---|
| **Open in browser** | [davidthegnomad.github.io/gnomad-webcanvas](https://davidthegnomad.github.io/gnomad-webcanvas/) |
| **Get / Download page** | […/gnomad-webcanvas/get/](https://davidthegnomad.github.io/gnomad-webcanvas/get/) |
| **Desktop releases** | [GitHub Releases](https://github.com/davidthegnomad/gnomad-webcanvas/releases) |
| **Beta feedback** | [david@gnomad.studio](mailto:david@gnomad.studio?subject=Webcanvas%20Beta%20Feedback) |

> **Public beta (v0.1.0-beta.1)** — features may change. Export or save work regularly.

### End-user install (desktop)

1. Download the installer for your OS from [Releases](https://github.com/davidthegnomad/gnomad-webcanvas/releases)
2. **Linux (Fedora/Nobara):** use the **`.rpm`** or **`.AppImage`** — not the `.deb`
3. **Windows:** run the `.msi` or `.exe`
4. **macOS:** open the `.dmg` and drag the app to Applications

Double-click `.html` or `.txt` files to open them in Webcanvas (after setting it as the default app if prompted).

---

## Features

- Monaco editor — HTML, CSS, and JavaScript panes with syntax highlighting
- Live preview with console capture and viewport presets (mobile / tablet / desktop)
- Light, dark, and high-contrast themes
- Starter templates + save your own custom templates
- CDN library injection (Tailwind, GSAP, Chart.js, Font Awesome, etc.)
- Export as ZIP · share via URL hash
- Floating tools — color picker, CSS generator, font pairings
- **Desktop only:** native open/save, save-on-close prompt, file associations

---

## For developers

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| [Node.js](https://nodejs.org/) | 22+ | Frontend build & Vite |
| [Rust](https://rustup.rs/) | 1.77+ | Tauri desktop shell |
| **Linux only** | — | WebKit/GTK dev packages (see below) |

### Install

```bash
git clone https://github.com/davidthegnomad/gnomad-webcanvas.git
cd gnomad-webcanvas

# Install frontend dependencies (uses package-lock.json)
npm ci

# Optional: copy environment template
cp .env.example .env
```

**Linux desktop build dependencies (Fedora/Nobara/RHEL):**

```bash
./scripts/install-linux-deps.sh   # requires sudo
```

### Run

```bash
# Web only — hot reload at http://127.0.0.1:5173
npm run dev

# Desktop dev (macOS / Windows / Linux X11)
npm run tauri:dev

# Desktop dev on Linux Wayland (Nobara/Fedora workaround)
npm run tauri:dev:linux

# Lint
npm run lint
```

### Build

```bash
# Web production build → dist/
npm run build

# Preview production build locally
npm run preview

# Desktop installers → src-tauri/target/release/bundle/
npm run tauri:build

# Linux local build script (deps + npm ci + tauri:build)
./scripts/build-linux-local.sh
```

---

## Dependency management

This is a **Node.js + Rust** project, not Python — `requirements.txt`, Poetry, and uv do not apply.

| Layer | Manager | Lockfile | Install command |
|-------|---------|----------|-----------------|
| Frontend | npm | `package-lock.json` | `npm ci` |
| Desktop shell | Cargo | `src-tauri/Cargo.lock` | (via `npm run tauri:build`) |

Always commit both lockfiles. CI uses `npm ci` for reproducible installs. To update frontend deps: edit `package.json`, run `npm install`, commit the lockfile change.

Rust dependencies are declared in `src-tauri/Cargo.toml` and resolved automatically by Cargo.

---

## Environment variables

Webcanvas has **no required API keys or secrets**. The only build-time variable is the Vite base path for subpath deployments (e.g. GitHub Pages).

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BASE_PATH` | No | Asset base URL. Default `/`. CI sets `/gnomad-webcanvas/` for Pages. |

See [`.env.example`](.env.example) for full documentation. Restart the dev server after editing `.env`.

---

## Project structure

```
gnomad-webcanvas/
├── src/                  # React frontend (TypeScript, Tailwind, Zustand)
├── src-tauri/            # Rust/Tauri backend, capabilities, bundling
├── public/               # Static assets + get/ download landing page
├── scripts/              # Linux install/build helper scripts
├── .github/workflows/    # CI: web deploy, desktop release, test builds
├── package.json          # Frontend deps & npm scripts
└── .env.example          # Optional environment template
```

---

## Release

| Target | Trigger | Output |
|--------|---------|--------|
| **Web** | Push to `main` | GitHub Pages ([Deploy Web](.github/workflows/deploy-web.yml)) |
| **Desktop** | Tag `v*` (e.g. `v0.1.0-beta.1`) | Draft GitHub Release with platform installers |
| **Test builds** | Actions → **Build Test Artifacts** → Run workflow | CI artifacts (not public) |

**GitHub Pages setup:** Settings → Pages → Source → **GitHub Actions** (do not use Jekyll or branch deploy).

Beta tags containing `beta` are marked as GitHub prereleases automatically.

---

## Stack

Tauri 2 · Vite 8 · React 19 · TypeScript · Tailwind CSS 4 · Monaco Editor · Zustand

## License

MIT (see `src-tauri/Cargo.toml`). © [Gnomad Studio](https://gnomadstudio.org).
