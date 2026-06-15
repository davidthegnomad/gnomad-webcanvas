# Gnomad Webcanvas — Cross-Platform Code Review

**Project:** `05_apps_and_extensions/gnomad-preview`  
**Scope:** macOS, Windows, Linux, and web parity (Tauri 2 + React 19)  
**Date:** 2026-06-15  
**Reviewers:** Codebase audit + Nemotron 3 Ultra (OpenRouter) synthesis  

> **Update 2026-06-15:** P0 + most P1/P2 code fixes implemented. Signing/notarization/Flatpak remain optional infra.

---

## Executive summary

- **Critical data-loss risk:** Desktop `Ctrl+S` / `Cmd+S` on an unsaved file (no `filePath` yet) calls `webBridge.saveProjectAs()`, which **returns `null`** — save appears to run but nothing is written.
- **No close guard:** `UnsavedChangesModal` exists but is never wired; Rust has no `CloseRequested` handler — closing the window drops dirty edits silently.
- **Desktop file UX is keyboard-only:** Open/Save work via shortcuts in `App.tsx`, but `TopNavbar` has no File menu or buttons — poor discoverability on all desktop OSes.
- **Open dialog vs parser mismatch:** Dialog filters only `.html`/`.htm`, while `fileContent.ts` already supports `.css`, `.js`, `.md`, `.txt` — dead capability.
- **Linux dev friction on Nobara/Fedora:** `npm run tauri:dev:linux` hardcodes `GDK_BACKEND=x11` and disables DMA-BUF; `install-linux-deps.sh` covers dnf but `BUILD_PLATFORMS.md` only documents apt.
- **CI coverage gaps:** Releases build macOS **arm64 only** (no Intel/universal), no notarization, no Windows signing, Linux **x86_64 only**.

---

## Critical bugs (P0 — fix before calling desktop “1.0”)

| # | File | Problem | Recommended fix | Effort |
|---|------|---------|-----------------|--------|
| 1 | `src/utils/platformBridge.ts` | `saveProject()` without `filePath` delegates to `webBridge.saveProjectAs()`, which always returns `null` on desktop. First save does nothing. | In `createTauriBridge()`, when `!filePath`, call the same `dialog.save` + `writeTextFile` logic as `saveProjectAs` (or invoke `saveProjectAs` on self, not `webBridge`). | **S** |
| 2 | `src/App.tsx`, `src-tauri/src/lib.rs` | No unsaved-changes prompt on window close. `UnsavedChangesModal.tsx` is never imported. | In `lib.rs`, intercept `CloseRequested`, prevent close, emit event to frontend. In `App.tsx`, show modal; save/discard/cancel before `getCurrentWindow().close()`. | **M** |
| 3 | `src/utils/platformBridge.ts` | Open filter: `['html', 'htm']` only. | Extend to `['html', 'htm', 'css', 'js', 'md', 'txt']` and route through `parseFileContent()` from `fileContent.ts` by extension. | **S** |
| 4 | `src/utils/projectManager.ts`, `src/App.tsx` | Desktop uses **both** `localStorage` projects and optional `currentFilePath` — two sources of truth; switching projects does not clear file path; “dirty” state conflates both models. | On desktop: file on disk is authoritative when `currentFilePath` is set; `localStorage` for session/recents only. Gate with `isDesktop()`. | **M** |
| 5 | `src-tauri/capabilities/default.json` | Broad `fs:allow-read-text-file` / `allow-write-text-file` without scoped paths (Tauri 2 best practice). | Add FS scopes limited to user-selected paths (dialog-granted) plus app data dir. See [Tauri fs scope docs](https://v2.tauri.app/reference/acl/permission/). | **S** |

### Verified code reference (bug #1)

```47:54:05_apps_and_extensions/gnomad-preview/src/utils/platformBridge.ts
    saveProject: async (html, css, js, filePath?) => {
      if (!filePath) {
        return webBridge.saveProjectAs!(html, css, js);
      }
      const content = assembleFullHtml(html, css, js);
      await writeTextFile(filePath, content);
      return filePath;
    },
```

`webBridge.saveProjectAs` is defined to `return null` — this is the first-save failure.

---

## macOS improvements

| # | File | Problem | Recommended fix | Effort |
|---|------|---------|-----------------|--------|
| 1 | `src-tauri/tauri.conf.json` | No signing/notarization config documented in repo. | Add `bundle.macOS` signing identity, entitlements plist (`com.apple.security.files.user-selected.read-write`), minimum macOS version. Document in `docs/BUILD_PLATFORMS.md`. | **M** |
| 2 | `.github/workflows/release.yml` | Matrix target `aarch64-apple-darwin` only — Intel Mac users get no CI-built artifact. | Add `x86_64-apple-darwin` job or universal binary via `lipo`; notarize with `notarytool` + staple in CI. | **L** |
| 3 | `src/components/ShortcutsModal.tsx`, `TopNavbar.tsx` | UI labels say `Ctrl+…` everywhere; macOS footnote is easy to miss. | Add `src/utils/modKeyLabel.ts`: detect macOS → show `⌘` in shortcuts modal and toolbar tooltips. | **S** |
| 4 | `src-tauri/src/lib.rs` | No native app menu (File → Open/Save/Quit). Expected on macOS. | Use `tauri::menu` — File, Edit (cut/copy/paste via predefined items), Window. Wire to same handlers as `App.tsx` shortcuts. | **M** |
| 5 | `docs/BUILD_PLATFORMS.md` | States releases are “drafts”; `release.yml` sets `releaseDraft: false` (auto-publish). | Align docs with workflow; add QA gate before tag if staying manual. | **S** |

---

## Windows improvements

| # | File | Problem | Recommended fix | Effort |
|---|------|---------|-----------------|--------|
| 1 | `src-tauri/tauri.conf.json` | NSIS in bundle targets; no documented code-signing or WebView2 bootstrap story. | Configure `bundle.windows.certificateThumbprint` for CI; document WebView2 Evergreen requirement in user guide. | **M** |
| 2 | `src/App.tsx` | Window title uses `currentFilePath.split(/[/\\]/).pop()` — works, but full path in title bar on some themes looks cluttered. | Use `@tauri-apps/api/path` `basename()` for title; optional status-bar path. | **S** |
| 3 | `.github/workflows/release.yml` | No `signtool` step after build. | Sign `.exe`/`.msi` in CI with stored cert; verify with `signtool verify`. | **M** |
| 4 | `src-tauri/src/lib.rs` | Same as macOS — no native menu/accelerators exposed in shell. | Shared menu setup with platform-appropriate accelerators (`Ctrl+` auto on Windows). | **M** |

---

## Linux improvements (Nobara / Fedora / Wayland)

| # | File | Problem | Recommended fix | Effort |
|---|------|---------|-----------------|--------|
| 1 | `package.json` | `"tauri:dev:linux"` forces `GDK_BACKEND=x11` and `WEBKIT_DISABLE_DMABUF_RENDERER=1`. Breaks native Wayland sessions; masks GPU issues instead of documenting them. | Default `tauri:dev` without overrides; add `tauri:dev:x11` escape hatch script; detect `WAYLAND_DISPLAY` in docs. | **M** |
| 2 | `scripts/install-linux-deps.sh` | Fedora/Nobara dnf packages — good for this machine. | Reference from `BUILD_PLATFORMS.md` (currently apt-only); add webkit2gtk version note for Tauri 2. | **S** |
| 3 | `.github/workflows/release.yml` | Ubuntu apt deps differ from `install-linux-deps.sh` — expected, but AppImage/deb testing on real Nobara not documented. | Add QA step: test AppImage on Fedora + deb on Ubuntu in release runbook. | **S** |
| 4 | `src-tauri/tauri.conf.json` | Targets `deb`, `rpm`, `appimage` — good. No Flatpak manifest for sandboxed distro installs. | Optional P2: `flatpak/org.gnomad.Webcanvas.yml` with portal-based file access. | **L** |
| 5 | `src/App.tsx` / theming | UI theme from editor preference only; no sync with system GTK light/dark on Linux. | `@tauri-apps/plugin-os` theme API or `prefers-color-scheme` for shell chrome (editor theme can stay independent). | **M** |

---

## Web vs desktop parity gaps

| # | File | Problem | Recommended fix | Effort |
|---|------|---------|-----------------|--------|
| 1 | `src/components/TopNavbar.tsx` | No Open / Save / Save As controls when `isDesktop()`. | Add compact File dropdown (desktop-only) calling `getPlatformBridge()` methods. | **S** |
| 2 | `src/utils/exportProject.ts` | Always uses `file-saver` blob download — works but bypasses native save location on desktop. | Extend `platformBridge` with `exportZip(blob, defaultName)` using Tauri save dialog + binary write. | **M** |
| 3 | `src/utils/platformBridge.ts` | `isDesktop()` checks `'__TAURI_INTERNALS__' in window` — correct for Tauri 2; no fallback if detection fails mid-load. | Also try dynamic `import('@tauri-apps/api/core')` `isTauri()` once; log detection failures in dev. | **S** |
| 4 | `src/components/PreviewFrame.tsx` | iframe `sandbox="allow-scripts"` only — some user HTML (forms, same-origin tricks) won't behave like a normal browser tab. | Document limitation; optional “relaxed sandbox” toggle for desktop with warning. | **S** |
| 5 | `src/utils/fileContent.ts` vs `parseHtmlFile.ts` | Duplicate HTML parsing (regex vs `DOMParser`); `fileContent.ts` unused by bridge. | Single module: export `parseHtmlFile` + `parseFileContent`; delete regex duplicate. | **S** |
| 6 | `src/main.tsx` | Web splash dismissal lives in index flow; desktop skips via `webSplash.ts` — OK. | No change; document in architecture doc. | — |

---

## CI / release gaps

| # | File | Problem | Recommended fix | Effort |
|---|------|---------|-----------------|--------|
| 1 | `.github/workflows/release.yml` | Single arch per OS; no checksums file, no artifact signing. | Matrix expansion; attach `SHA256SUMS`; consider `cosign` for supply chain. | **M** |
| 2 | `.github/workflows/release.yml` | `prerelease: true` — confirm intentional for beta channel. | Document in `RELEASE_RUNBOOK.md`; flip when stable. | **S** |
| 3 | `package.json` | No `tauri:build:ci` variant documenting env vars for signing. | Add script + env template in `.env.example` (signing secrets stay in CI only). | **S** |
| 4 | `src-tauri/tauri.conf.json` | `"csp": null` — permissive for a code editor loading user HTML/JS; acceptable for dev tool but worth hardening for production web deploy. | Separate CSP for web build vs desktop; desktop can stay relaxed for local preview fidelity. | **M** |

---

## Prioritized refactor roadmap

### P0 — Blockers for desktop 1.0

1. Fix `saveProject` first-save path (`platformBridge.ts`)
2. Wire `UnsavedChangesModal` + close guard (`lib.rs`, `App.tsx`)
3. Align open dialog filters with `parseFileContent`
4. Scope FS capabilities (`capabilities/default.json`)
5. Native File menu (`lib.rs`) + TopNavbar File dropdown

### P1 — Platform polish

6. Dynamic `⌘` / `Ctrl` labels in UI
7. Desktop-native ZIP export via save dialog
8. File-first project model on desktop (`projectManager.ts`)
9. macOS notarization + universal binary in CI
10. Windows code signing in CI
11. Linux: Wayland-friendly dev defaults + Fedora doc parity

### P2 — Quality of life

12. Deduplicate HTML parsers
13. System theme sync (Linux/macOS/Windows)
14. Configurable preview iframe sandbox
15. Recent files list (native menu or app menu)
16. Flatpak manifest (optional)

---

## Suggested fix order (copy-paste checklist)

```bash
# 1. platformBridge.ts — saveProject without path → dialog.save (not webBridge)
# 2. lib.rs + App.tsx — CloseRequested → UnsavedChangesModal
# 3. platformBridge.ts — open filters + parseFileContent routing
# 4. capabilities/default.json — fs scopes
# 5. lib.rs — native File/Edit/Window menu
# 6. TopNavbar.tsx — File menu (desktop only)
# 7. package.json — split tauri:dev vs tauri:dev:x11; document Nobara deps
# 8. release.yml + BUILD_PLATFORMS.md — signing, arch matrix, doc sync
```

---

## What already works well

- **Keyboard shortcuts** correctly use `e.metaKey || e.ctrlKey` in `App.tsx` — cross-platform modifier handling is sound.
- **Window title** dirty indicator (`*`) and path basename split handles `\` and `/`.
- **platformBridge pattern** cleanly separates web vs desktop; lazy Tauri plugin imports keep web bundle lean.
- **Bundle targets** in `tauri.conf.json` cover all three desktop packaging formats.
- **CI matrix** builds Linux + Windows + macOS on tag push — good foundation.
- **Vitest** covers parser, share URL, assembler — add platformBridge unit tests next.

---

## Related docs

- [CROSS_PLATFORM_CHECKLIST.md](./CROSS_PLATFORM_CHECKLIST.md) — pre-merge checklist
- [BUILD_PLATFORMS.md](./BUILD_PLATFORMS.md) — build instructions
- [QA_CHECKLIST.md](./QA_CHECKLIST.md) — manual QA before release

---

*Generated for Gnomad Studio internal review. Raw model artifact: `scripts/context-stack/offload-artifacts/gnomad-preview-cross-platform-review.json`*
