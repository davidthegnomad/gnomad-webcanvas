# Session State
> Last updated: 2026-05-30

## Current Focus
Rebrand to Gnomad Studio Webcanvas and publish to GitHub as `gnomad-webcanvas`.

## Recent Changes
- Renamed from LiveView Notepad → Gnomad Studio Webcanvas (menu bar: Webcanvas)
- Updated package IDs: npm `gnomad-webcanvas`, Tauri `com.gnomadstudio.webcanvas`
- Added GitHub Actions: desktop release + web deploy (GitHub Pages)
- Initialized standalone git repo and pushed to GitHub

## Open TODOs
- [ ] Enable GitHub Pages (Actions source) in repo settings
- [ ] Tag `v0.1.0` to trigger first desktop release build
- [ ] Install Linux WebKitGTK deps locally if building desktop on Fedora/Nobara

## Last Git
- Branch: main
- Remote: https://github.com/davidthegnomad/gnomad-webcanvas
- Repo: gnomad-webcanvas (standalone, not in gnomad-workspace monorepo)

## Blockers / Notes
- `05_apps_and_extensions/` is gitignored in the parent gnomad-workspace meta repo — this project has its own repo.
