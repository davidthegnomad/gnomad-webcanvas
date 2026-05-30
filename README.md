# Gnomad Studio Webcanvas

![Beta](https://img.shields.io/badge/status-public%20beta-amber?style=flat-square)

Live HTML/CSS/JS editor with instant preview. Built by [Gnomad Studio](https://gnomadstudio.org).

**Webcanvas** runs in the browser or as a native desktop app (Tauri) on Linux, macOS, and Windows.

## Try it

| | Link |
|---|---|
| **Web app (beta)** | [davidthegnomad.github.io/gnomad-webcanvas](https://davidthegnomad.github.io/gnomad-webcanvas/) |
| **Get / Download page** | […/gnomad-webcanvas/get/](https://davidthegnomad.github.io/gnomad-webcanvas/get/) |
| **Desktop releases** | [GitHub Releases](https://github.com/davidthegnomad/gnomad-webcanvas/releases) |
| **Beta feedback** | [david@gnomad.studio](mailto:david@gnomad.studio?subject=Webcanvas%20Beta%20Feedback) |

> **Beta (v0.1.0-beta.1)** — features may change. Export or save work regularly.

## Features

- Monaco code editor with HTML, CSS, and JavaScript panes
- Live preview with console capture
- Light / dark / high-contrast themes
- Starter templates + save your own custom templates
- Project management (browser localStorage or native file open/save on desktop)
- CDN library injection (Tailwind, GSAP, Chart.js, etc.)
- Export projects as ZIP · share via URL hash
- Floating tools: color picker, CSS generator, font pairings
- Desktop: save-on-close prompt, shell file associations (`.html`, `.txt`)

## Development

```bash
npm install
npm run dev              # web dev server at http://127.0.0.1:5173
npm run tauri:dev        # desktop dev mode
npm run tauri:dev:linux  # Linux Wayland workaround (Nobara/Fedora)
```

### Linux build deps (Fedora/Nobara)

```bash
./scripts/install-linux-deps.sh
./scripts/build-linux-local.sh
```

## Build

```bash
npm run build        # web build → dist/
npm run tauri:build  # desktop installers (.rpm, .deb, .AppImage, .msi, .dmg)
```

## Release

- **Web:** push to `main` — GitHub Actions deploys to GitHub Pages
- **Desktop:** tag `v*` (e.g. `v0.1.0-beta.1`) — GitHub Actions builds Linux, Windows, and macOS installers (draft release; beta tags marked prerelease)
- **Private test builds:** Actions → **Build Test Artifacts** → Run workflow → download Artifacts

Enable **GitHub Pages** (Source: GitHub Actions) in repo Settings if the web URL 404s.

## Stack

Tauri 2 · Vite 8 · React 19 · TypeScript · Tailwind CSS 4 · Monaco Editor · Zustand
