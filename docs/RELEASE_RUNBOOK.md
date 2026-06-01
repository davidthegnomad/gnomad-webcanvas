# Release Runbook — Gnomad Webcanvas

**Version:** 0.1.0-beta.2  
**Last updated:** June 2026

---

## Overview

Releases are triggered by pushing a **version tag** (`v*`). GitHub Actions builds macOS, Linux, and Windows installers and creates a **draft** GitHub Release.

Workflow: `.github/workflows/release.yml`

---

## Pre-release checklist

```bash
cd 05_apps_and_extensions/gnomad-preview

# Quality gates
npm run lint
npm run test
npx tsc -b --noEmit
npm run build

# Desktop smoke (local)
npm run tauri:build   # on your OS

# Docs current
npm run docs:export
```

- [ ] [CHANGELOG.md](../CHANGELOG.md) updated
- [ ] `npm run test` passes (19 unit tests)
- [ ] Version bumped in `package.json` and `src-tauri/tauri.conf.json`
- [ ] [QA_CHECKLIST.md](QA_CHECKLIST.md) completed for target platforms
- [ ] No secrets in diff

---

## Version bump

Align these files:

| File | Field |
|------|-------|
| `package.json` | `"version"` |
| `src-tauri/tauri.conf.json` | `"version"` |
| `CHANGELOG.md` | New section header |

---

## Tag and release

```bash
git pull origin main
git add -A
git commit -m "Release v0.1.0"
git tag -a v0.1.0 -m "Gnomad Webcanvas v0.1.0"
git push origin main
git push origin v0.1.0
```

Monitor **Actions → Release Desktop Builds**. Expect three matrix jobs:

| Job | Artifact |
|-----|----------|
| macOS (aarch64) | `.dmg`, `.app` |
| Ubuntu (x86_64) | `.deb`, `.rpm`, AppImage |
| Windows (x86_64) | `.msi`, `.exe` |

---

## Post-CI steps

1. Open the **draft release** on GitHub
2. Verify attached assets per platform
3. Edit release notes (copy from CHANGELOG)
4. Publish release (or keep draft for internal QA)
5. Smoke-install one artifact per OS

---

## Rollback

| Scenario | Action |
|----------|--------|
| Bad tag pushed | Delete release + tag; fix; re-tag |
| Single platform failed | Re-run failed job or patch and tag `v0.1.1` |
| Critical bug in published release | Mark release as pre-release; publish hotfix tag |

Never force-push tags that others may have pulled.

---

## Future: signing & notarization

Not yet configured. When adding:

| Secret | Purpose |
|--------|---------|
| `TAURI_SIGNING_PRIVATE_KEY` | Updater + bundle signing |
| `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID` | macOS notarization |

See Gnomad Desktop Assistant [UPDATER.md](https://github.com/davidthegnomad/gnomad-desktop-assistant/blob/main/docs/UPDATER.md) for key setup pattern.

---

## Human-only actions

See [HUMAN.md](../HUMAN.md) for owner checklist (signing keys, store submissions).

---

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙
