# Release Runbook — Gnomad Webcanvas

**Version:** 0.1.0-beta.2  
**Last updated:** June 2026

---

## Overview

Releases are triggered by pushing a **version tag** (`v*`). GitHub Actions builds macOS, Linux, and Windows installers and **publishes** a GitHub Release automatically (no manual publish step).

**From Cursor:** ask the agent to release, or run:

```bash
npm run release              # full flow: test → tag → CI → publish
npm run release -- --retag   # rebuild after CI fix (same version)
```

Workflow: `.github/workflows/release.yml` · Skill: `.cursor/skills/release-gnomad-webcanvas/SKILL.md`

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
npm run release
```

The script runs tests, creates `v{version}` from `package.json`, pushes the tag, waits for CI, and verifies the release is published.

To rebuild the same version after a CI fix:

```bash
npm run release -- --retag
```

| Job | Artifact |
|-----|----------|
| macOS (aarch64) | `.dmg`, `.app` |
| Ubuntu (x86_64) | `.deb`, `.rpm`, AppImage |
| Windows (x86_64) | `.msi`, `.exe` |

---

## Post-CI steps

Automated by `npm run release`. Optional manual smoke test:

1. Download one artifact per platform from the GitHub Release
2. Walk [docs/QA_CHECKLIST.md](QA_CHECKLIST.md) on at least one platform

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
