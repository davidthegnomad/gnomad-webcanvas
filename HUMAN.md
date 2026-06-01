# HUMAN.md — Actions only you can take

**Project:** Gnomad Webcanvas · **Version on main:** 0.1.0  
**Last updated:** June 2026

Everything else (code, docs, CI) can be automated on `main`. This file is the **owner checklist** for release tags, signing keys, and legal sign-off that require a human.

---

## Priority order

| # | Task | Blocker for | Est. time |
|---|------|-------------|-----------|
| 1 | [First release tag](#1-first-release-tag-v010) | Downloadable installers | ~5 min + CI wait |
| 2 | [GitHub repo / Pages](#2-github-repo--pages-optional) | Public docs site | ~15 min |
| 3 | [Apple Developer + notarization](#3-apple-developer--notarization) | Enterprise macOS | ~1 hr + $99/yr |
| 4 | [Updater signing keys](#4-updater-signing-keys-future) | In-app updates | ~15 min |
| 5 | [WCAG / accessibility audit](#5-wcag--accessibility-audit) | v1.0 GA | External or 1 day |

---

## 1. First release tag (v0.1.0)

**Why:** CI release workflow only runs on `v*` tags. Without a tag, no GitHub Release artifacts exist.

**When ready:**

```bash
cd 05_apps_and_extensions/gnomad-preview
npm run lint
npx tsc -b --noEmit
npm run build
npm run docs:export
git tag -a v0.1.0 -m "Gnomad Webcanvas v0.1.0"
git push origin v0.1.0
```

Monitor **Actions → Release Desktop Builds**. Expect three matrix jobs (macOS, Linux, Windows).

**After CI:** Walk [docs/QA_CHECKLIST.md](docs/QA_CHECKLIST.md) on at least one platform, then publish the draft release.

**Docs:** [docs/RELEASE_RUNBOOK.md](docs/RELEASE_RUNBOOK.md)

---

## 2. GitHub repo & Pages (optional)

**Why:** Host `docs/index.html` as a project site (like Gnomad Desktop Assistant).

**Steps:**

1. Push project to a public or org GitHub repository
2. Settings → Pages → Deploy from branch → `/docs` folder or GitHub Actions
3. Update any hardcoded URLs in docs if repo name differs

Reference workflow: Gnomad Desktop Assistant `.github/workflows/pages.yml`

---

## 3. Apple Developer + notarization

**Why:** Gatekeeper blocks unsigned macOS apps for most users outside dev mode.

**Prerequisites:**

- [Apple Developer Program](https://developer.apple.com/programs/) membership ($99/year)
- **Developer ID Application** certificate
- App-specific password for `notarytool`

Add GitHub Actions secrets when ready:

| Secret | Purpose |
|--------|---------|
| `APPLE_ID` | Apple ID email |
| `APPLE_PASSWORD` | App-specific password |
| `APPLE_TEAM_ID` | 10-char Team ID |

Follow Gnomad Desktop Assistant pattern: [MACOS_NOTARIZATION.md](https://github.com/davidthegnomad/gnomad-desktop-assistant/blob/main/docs/MACOS_NOTARIZATION.md)

---

## 4. Updater signing keys (future)

**Why:** In-app updates require minisign key pair in `tauri.conf.json`.

Not configured in v0.1. When adding Tauri updater plugin:

1. Generate keys (see desktop assistant `npm run setup:updater-keys` pattern)
2. Add `TAURI_SIGNING_PRIVATE_KEY` to GitHub Actions secrets
3. Document in `docs/UPDATER.md`

---

## 5. WCAG / accessibility audit

**Why:** [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) claims partial conformance; full WCAG 2.2 AA needs human verification.

**Minimum manual pass:**

- VoiceOver (macOS) or NVDA (Windows)
- Keyboard-only: edit → preview → export → shortcuts modal
- High contrast Monaco theme readability

---

## What agents already handle

- Code, docs export, lint/typecheck guidance
- Release workflow when **you** push a `v*` tag
- Documentation in `docs/` (MD source)

---

## Quick reference commands

```bash
npm run docs:export     # regenerate HTML/TXT from Markdown
npm run tauri:dev       # local desktop dev
npm run tauri:build     # local production build
npm run lint            # ESLint
```

---

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙
