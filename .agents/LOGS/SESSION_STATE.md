# Session State
> Last updated: 2026-06-01

## Current Focus
Customer-facing branding unified as **Gnomad Webcanvas** (docs, UI, releases, Tauri bundle).

## Recent Changes
- Added `src/constants/branding.ts` as single source for product name
- Rebranded all docs (MD/HTML/TXT), README, CHANGELOG, landing pages
- Tauri: `productName` / window title → Gnomad Webcanvas; identifier `com.gnomad.webcanvas`
- Release workflow: `releaseName: Gnomad Webcanvas ${{ github.ref_name }}`
- Default template: `Hello, Webcanvas!`; export prefix `webcanvas-project`
- Vitest 19/19 passing; docs export regenerated

## Open TODOs
- [ ] Tag `v0.1.0-beta.2` (or beta.3) to publish desktop installers with new name
- [ ] Re-integrate desktop file-association features from earlier beta if needed

## Last Git
- Branch: main
- Remote: https://github.com/davidthegnomad/gnomad-webcanvas
- Version: 0.1.0-beta.2
- Pages: https://davidthegnomad.github.io/gnomad-webcanvas/

## Blockers / Notes
- Internal codename / folder: `gnomad-preview` (not customer-facing)
- localStorage keys and custom events still use `liveview-*` for backward compatibility
