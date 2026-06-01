# Build Narrative — LiveView Notepad

**Version:** 0.1.0  
**Last updated:** June 2026

---

## Vision

Deliver a **zero-backend live code playground** that feels native on desktop and works instantly in the browser — Monaco editing, real-time preview, one-click export, and shareable URLs.

---

## Phase 1 — Web MVP ✓

**Goal:** Prove the editor + preview loop in pure React.

| Deliverable | Status |
|-------------|--------|
| Three-pane Monaco layout (HTML/CSS/JS) | ✓ |
| Live iframe preview with debounce | ✓ |
| Resizable panels (vertical/horizontal) | ✓ |
| Zustand state management | ✓ |
| localStorage project persistence | ✓ |
| CDN library registry | ✓ |
| Starter templates | ✓ |
| ZIP export (JSZip) | ✓ |

**Outcome:** Usable web playground at `npm run dev`.

---

## Phase 2 — Preview polish ✓

**Goal:** Production-quality preview and designer tooling.

| Deliverable | Status |
|-------------|--------|
| Viewport presets (mobile/tablet/desktop) | ✓ |
| Preview pause + force refresh | ✓ |
| Preview fullscreen mode | ✓ |
| Console panel (iframe postMessage) | ✓ |
| Preview background modes (white/dark/checkerboard) | ✓ |
| Font pairings + Google Fonts injection | ✓ |
| Floating tools (color picker, CSS generator) | ✓ |
| URL hash sharing (lz-string) | ✓ |
| Keyboard shortcuts + modal | ✓ |

**Outcome:** Feature-complete editor experience for demos and daily use.

---

## Phase 3 — Tauri desktop ✓

**Goal:** Native Open/Save without changing the React codebase.

| Deliverable | Status |
|-------------|--------|
| Tauri 2 scaffold | ✓ |
| Platform bridge (web vs desktop) | ✓ |
| Native open/save dialogs | ✓ |
| Single-file HTML assemble/parse | ✓ |
| Window title + dirty indicator | ✓ |
| Tauri capabilities (fs, dialog) | ✓ |
| GitHub Actions release workflow | ✓ |

**Outcome:** Same UI in browser and desktop; desktop adds file I/O.

---

## Phase 4 — Documentation & release readiness ✓

**Goal:** Portfolio-grade docs matching Gnomad Desktop Assistant standards.

| Deliverable | Status |
|-------------|--------|
| README overhaul | ✓ |
| docs/ suite (MD + HTML + TXT) | ✓ |
| User guide, tech stack, architecture | ✓ |
| QA checklist, release runbook | ✓ |
| CHANGELOG, HUMAN.md | ✓ |

---

## Phase 5 — Quality hardening ✓

**Goal:** Address review feedback — tests, robust parsing, accessibility themes.

| Deliverable | Status |
|-------------|--------|
| Vitest unit tests (19) | ✓ |
| DOMParser-based `parseHtmlFile` | ✓ |
| Shell UI themes (dark/light/hc) | ✓ |
| Persisted theme preference | ✓ |

---

## Phase 6 — v1.0 (planned)

| Item | Priority |
|------|----------|
| Playwright E2E smoke tests | P0 |
| Auto-updater (Tauri plugin) | P1 |
| macOS notarization in CI | P1 |
| Multi-file project folders | P2 |
| GitHub Pages demo deploy | P2 |

See [ROADMAP.md](ROADMAP.md) for full timeline.

---

## Technical decisions

| Decision | Rationale |
|----------|-----------|
| **Zustand over Redux** | Minimal boilerplate for editor state |
| **iframe srcDoc over eval** | Sandboxed user JS; no DOM pollution |
| **Platform bridge pattern** | Single React bundle for web + desktop |
| **Single HTML file on desktop** | Simplest Open/Save UX for v0.1 |
| **DOMParser for file open** | Robust HTML parsing vs regex |
| **lz-string URL sharing** | No server; instant share in browser mode |
| **Thin Rust backend** | File I/O via plugins; defer custom commands |

---

## Build commands reference

```bash
npm run dev          # Web dev server
npm run tauri:dev    # Desktop dev (Vite + Tauri)
npm run build        # Production frontend
npm run tauri:build  # Desktop installer
npm run lint         # ESLint
npm run test         # Vitest unit tests
npm run docs:export  # Regenerate HTML/TXT docs
```

Per-OS details: [BUILD_PLATFORMS.md](BUILD_PLATFORMS.md)

---

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙
