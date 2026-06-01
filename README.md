# Gnomad Webcanvas

[![Beta](https://img.shields.io/badge/status-beta-818cf8)](https://davidthegnomad.github.io/gnomad-webcanvas/)
[![Version](https://img.shields.io/badge/version-0.1.0--beta.2-818cf8)](CHANGELOG.md)
[![Platforms](https://img.shields.io/badge/platforms-macOS%20%7C%20Windows%20%7C%20Linux%20%7C%20Web-333)](docs/BUILD_PLATFORMS.md)

**Gnomad Webcanvas** is a live HTML/CSS/JS playground with Monaco editing, instant iframe preview, project export, URL sharing, and native Open/Save on desktop — built with Tauri and React.

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙

**Live project site:** [davidthegnomad.github.io/gnomad-webcanvas](https://davidthegnomad.github.io/gnomad-webcanvas/) · **Play in browser:** [app](https://davidthegnomad.github.io/gnomad-webcanvas/app/)

---

## Why this exists

Quick UI experiments shouldn't require spinning up a dev server or switching to an online sandbox. Gnomad Webcanvas gives you three synchronized editor panes, a live preview, designer tools (colors, fonts, CSS snippets), and one-click ZIP export — running locally in the browser or as a native desktop app.

---

## Capabilities (v0.1.0)

| Area | What you get |
|------|----------------|
| **Editor** | Monaco HTML/CSS/JS panes, resizable layout, dark/light/hc themes |
| **Preview** | Live iframe, viewport presets, console capture, fullscreen |
| **Projects** | Multi-project localStorage, starter templates |
| **Libraries** | Toggle CDN libs (Tailwind, GSAP, Three.js, …) |
| **Tools** | Color picker, CSS generator, font pairings |
| **Export** | ZIP download (index.html + style.css + script.js) |
| **Share** | LZ-compressed URL hash — no backend |
| **Desktop** | Tauri Open/Save (DOMParser file parsing), window title + dirty indicator |
| **Testing** | Vitest unit tests (19) for parser, share URL, preview assembler |
| **Platform** | macOS, Windows, Linux installers via CI; web via Vite |

---

## Quick start

### End users

1. Download installer from GitHub Releases (when published), or run from source below.
2. Edit HTML/CSS/JS — preview updates automatically.
3. Read the full manual: [`docs/USER_GUIDE.html`](docs/USER_GUIDE.html) or [`docs/USER_GUIDE.txt`](docs/USER_GUIDE.txt).

### Developers

**Prerequisites:** Node.js LTS, Rust stable, [Tauri v2 platform deps](https://v2.tauri.app/start/prerequisites/)

```bash
cd 05_apps_and_extensions/gnomad-preview
npm install
npm run dev          # Web: http://localhost:5173
npm run tauri:dev    # Desktop shell + Vite HMR
npm run test         # Vitest unit tests (19)
npm run lint         # ESLint
```

**Production build:**

```bash
npm run build
npm run tauri:build
```

---

## Architecture (summary)

```
┌─────────────────────────────────────────────────────────┐
│  React 19 UI (Monaco, preview iframe, floating tools)   │
└───────────────────────────┬─────────────────────────────┘
                            │ platformBridge (web vs Tauri)
┌───────────────────────────▼─────────────────────────────┐
│  Tauri 2: fs + dialog plugins (Open/Save)             │
└─────────────────────────────────────────────────────────┘
```

Deep dive: [`docs/TECH_STACK.md`](docs/TECH_STACK.md) · [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## Documentation index

All docs ship as **Markdown** (source), **HTML** (browser), and **TXT** (Notepad/Word). Full index: [`docs/DOCS_INDEX.md`](docs/DOCS_INDEX.md). Regenerate: `npm run docs:export`.

| Document | MD | HTML | TXT |
|----------|----|------|-----|
| **All docs (index)** | [docs/DOCS_INDEX.md](docs/DOCS_INDEX.md) | [docs/DOCS_INDEX.html](docs/DOCS_INDEX.html) | [docs/DOCS_INDEX.txt](docs/DOCS_INDEX.txt) |
| **Project site** | — | [docs/index.html](docs/index.html) | — |
| User Guide | [docs/USER_GUIDE.md](docs/USER_GUIDE.md) | [docs/USER_GUIDE.html](docs/USER_GUIDE.html) | [docs/USER_GUIDE.txt](docs/USER_GUIDE.txt) |
| Tech Stack | [docs/TECH_STACK.md](docs/TECH_STACK.md) | [docs/TECH_STACK.html](docs/TECH_STACK.html) | [docs/TECH_STACK.txt](docs/TECH_STACK.txt) |
| Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | [docs/ARCHITECTURE.html](docs/ARCHITECTURE.html) | [docs/ARCHITECTURE.txt](docs/ARCHITECTURE.txt) |
| Build Platforms | [docs/BUILD_PLATFORMS.md](docs/BUILD_PLATFORMS.md) | [docs/BUILD_PLATFORMS.html](docs/BUILD_PLATFORMS.html) | [docs/BUILD_PLATFORMS.txt](docs/BUILD_PLATFORMS.txt) |
| Roadmap | [docs/ROADMAP.md](docs/ROADMAP.md) | [docs/ROADMAP.html](docs/ROADMAP.html) | [docs/ROADMAP.txt](docs/ROADMAP.txt) |
| Test Strategy | [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md) | [docs/TEST_STRATEGY.html](docs/TEST_STRATEGY.html) | [docs/TEST_STRATEGY.txt](docs/TEST_STRATEGY.txt) |
| Accessibility | [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) | [docs/ACCESSIBILITY.html](docs/ACCESSIBILITY.html) | [docs/ACCESSIBILITY.txt](docs/ACCESSIBILITY.txt) |
| Changelog | [CHANGELOG.md](CHANGELOG.md) | [CHANGELOG.html](CHANGELOG.html) | [CHANGELOG.txt](CHANGELOG.txt) |

---

## CI / releases

GitHub Actions builds **macOS**, **Linux**, and **Windows** on tagged `v*` releases. See [`docs/RELEASE_RUNBOOK.md`](docs/RELEASE_RUNBOOK.md).

---

## License

Private project — see repository settings. Contact [Gnomad Studio](https://gnomadstudio.org) for licensing inquiries.

---

## Acknowledgments

Built with [Tauri](https://v2.tauri.app/), [React](https://react.dev/), [Monaco Editor](https://microsoft.github.io/monaco-editor/), and [Vite](https://vite.dev/).
