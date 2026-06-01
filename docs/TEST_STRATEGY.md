# Test Strategy — LiveView Notepad

**Version:** 0.1.0  
**Last updated:** June 2026

---

## Overview

Testing layers progress from fast automated checks to manual cross-platform QA before release.

```
Unit tests (Vitest)     →  19 tests — parseHtmlFile, shareUrl, assembleSource
Type check + lint       →  every commit / pre-release
Production build        →  pre-release
Manual QA checklist     →  every release
```

---

## Layer 1 — Static analysis (current)

```bash
npm run lint              # ESLint
npx tsc -b --noEmit       # TypeScript strict
npm run test              # Vitest unit tests (19 tests)
```

**Covers:** Type errors, unused imports, React hooks rules, parser/share/assembler behavior.

---

## Layer 2 — Unit tests ✓

**Framework:** Vitest + jsdom

**Implemented suites** (`src/utils/__tests__/`):

| Module | Cases |
|--------|-------|
| `parseHtmlFile.ts` | DOMParser extraction, multiple style/script tags, round-trip, edge cases |
| `shareUrl.ts` | LZ encode/decode round-trip, optional fields, invalid hash, unicode |
| `assembleSource.ts` | CDN injection, Google Fonts, deduplication, runtime error wrapper |

```bash
npm run test              # single run
npm run test:watch        # watch mode
```

---

## Layer 3 — Integration / E2E (planned)

| Tool | Scope |
|------|-------|
| Playwright | Web mode: edit → preview update → export |
| Tauri WebDriver | Desktop: open/save dialogs (headless limited) |

Not in v0.1 scope — manual QA covers critical paths.

---

## Layer 4 — Manual QA

[QA_CHECKLIST.md](QA_CHECKLIST.md) — required before every tagged release.

Minimum smoke (5 min) documented in checklist.

---

## Layer 5 — Rust backend

Current Rust surface is plugin-only (no custom commands).

```bash
cd src-tauri && cargo check && cargo test
```

Add command-specific tests when custom `#[tauri::command]` handlers land.

---

## CI gates

| Trigger | Checks |
|---------|--------|
| PR / push (future) | lint, tsc, build |
| Tag `v*` | Full Tauri matrix build |

Release workflow (`.github/workflows/release.yml`) does not yet run lint — add a `build.yml` for PR gates.

---

## Coverage goals (v1.0)

| Area | Target | Status |
|------|--------|--------|
| Pure utils (`assembleSource`, `shareUrl`, `parseHtmlFile`) | 80%+ | ✓ 19 tests shipped |
| Zustand store actions | Key paths covered | Planned |
| React components | Smoke E2E only | Planned (Playwright) |
| Rust commands | Per-command when added | N/A (no custom commands) |

---

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙
