# Gnomad Studio Webcanvas

Live HTML/CSS/JS editor with instant preview. Built by [Gnomad Studio](https://gnomadstudio.org).

**Webcanvas** runs in the browser or as a native desktop app (Tauri) on Linux, macOS, and Windows.

## Features

- Monaco code editor with HTML, CSS, and JavaScript panes
- Live preview with console capture
- Project management (browser localStorage or native file open/save on desktop)
- Export projects as ZIP
- Share projects via URL hash
- Floating tools: color picker, CSS generator, font pairings

## Development

```bash
npm install
npm run dev          # web dev server at http://localhost:5173
npm run tauri:dev    # desktop dev mode
```

## Build

```bash
npm run build        # web build → dist/
npm run tauri:build  # desktop installers
```

## Release

- **Web:** push to `main` — GitHub Actions deploys to GitHub Pages
- **Desktop:** tag `v*` (e.g. `v0.1.0`) — GitHub Actions builds Linux, Windows, and macOS installers

## Stack

Tauri 2 · Vite 8 · React 19 · TypeScript · Tailwind CSS 4 · Monaco Editor · Zustand
