# Changelog — Gnomad Webcanvas

All notable changes to this project are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/).

---

## [0.1.0-beta.6] — 2026-06-23

### Added

- Linux/macOS platform split (menus, build configs, runtime hooks)
- Bundled Monaco editor (offline; no CDN dependency under CSP)
- Robust File/Help menu bar with Close, About, and Check for Updates
- `finish_close` flow for reliable Quit on Linux
- `scripts/launch-linux.sh` — kills stale AppImage extracts before launch
- Path guard for desktop file reads (blocks system paths)
- Unit tests for update status helpers and path guard

### Fixed

- HTML/CSS/JS editors stuck on “Loading editor…” (CSP blocked jsDelivr Monaco CDN)
- Window Quit/Close blocked after unsaved-changes hook (`prevent_close` without release)
- Stale AppImage extract pointing at `localhost:5173` instead of bundled assets
- Linux AppImage build on Fedora 43+ (`NO_STRIP=1`)

---

## [0.1.0-beta.3] — 2026-06-09

### Added

- Custom WC app icon (Tauri bundle + web favicon)
- Native macOS menu bar with About modal and in-app updater
- Desktop export via native Save dialog (ZIP)
- Share copies public GitHub Pages URL on desktop

### Fixed

- Templates and CDN libs now update Monaco editor and live preview
- Cmd+Tab app switcher (activation policy, single-instance focus, dock reopen)
- Default HTML template: `Welcome to Webcanvas!`

---

## [0.1.0-beta.2] — 2026-06-01

### Added

- Vitest unit tests (19) for `parseHtmlFile`, `shareUrl`, and `assembleSource`
- DOMParser-based HTML file parsing (replaces fragile regex)
- Shell UI themes synced with Monaco theme selector (dark / light / high contrast)
- Persisted editor theme preference in localStorage
- Full documentation suite (MD + HTML + TXT) with GitHub Pages deploy

### Changed

- Official product name unified to **Gnomad Webcanvas** across UI, docs, releases, and Tauri bundle metadata
- `parseHtmlFile` extracted to `src/utils/parseHtmlFile.ts` for testability
- App chrome uses CSS theme variables instead of hardcoded dark-only colors
- GitHub Pages serves docs at site root and web app at `/app/`

---

## [0.1.0-beta.1] — 2026-05-30

Initial beta on GitHub (`gnomad-webcanvas`) — Tauri desktop shell, Monaco editor, live preview.

---

## [0.1.0] — 2026-06-01

### Added

- Monaco editor with HTML, CSS, and JavaScript panes
- Live iframe preview with 500 ms debounce
- Resizable vertical/horizontal panel layout
- Preview viewport presets (mobile, tablet, desktop)
- Preview pause, force refresh, and fullscreen modes
- Console panel capturing iframe log/warn/error
- Multi-project localStorage persistence with legacy migration
- Starter templates (blank, landing page, dashboard, …)
- CDN library registry (Tailwind, Bootstrap, GSAP, Three.js, …)
- ZIP export (index.html, style.css, script.js)
- URL hash sharing via lz-string compression
- Floating tools: color picker, CSS generator, font pairings
- Keyboard shortcuts with modal reference
- Tauri 2 desktop shell with native Open/Save
- Platform bridge for web vs desktop file I/O
- GitHub Actions release workflow (macOS, Linux, Windows)
- Full documentation suite (MD + HTML + TXT)

### Known limitations (v0.1.0 baseline)

- No Playwright E2E tests yet (unit tests only)
- No auto-updater
- Desktop saves single self-contained `.html` file (not multi-file workspace)
- macOS builds unsigned (Gatekeeper may warn)

---

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙
