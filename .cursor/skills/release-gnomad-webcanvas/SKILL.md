---
name: release-gnomad-webcanvas
description: >-
  Ship a Gnomad Webcanvas desktop beta release from Cursor — tag, push, wait for
  CI, and publish GitHub Release without opening github.com. Use when the user asks
  to release, ship, tag, publish beta, or cut a version of Gnomad Webcanvas.
---

# Release Gnomad Webcanvas

Automated end-to-end release. **No GitHub website login required** — uses `gh` CLI (one-time `gh auth login` on this machine).

## When the user says "release" / "ship beta" / "tag it"

Run from project root (`05_apps_and_extensions/gnomad-preview`):

```bash
npm run release
```

This will:
1. Verify `gh` auth and clean `main` branch
2. Run `npm run test` + `npm run build`
3. Create annotated tag `v{version}` from `package.json`
4. Push tag → triggers **Release Desktop Builds** workflow
5. Wait for macOS / Windows / Linux builds
6. Verify the GitHub Release is **published** (not draft)

## Before releasing a *new* version

Align version in:
- `package.json`
- `src-tauri/tauri.conf.json`
- `public/get/index.html` (version line)
- `CHANGELOG.md` (new `## [x.y.z]` section)

Commit and push to `main`, then `npm run release`.

## Flags

| Command | Use when |
|---------|----------|
| `npm run release -- --retag` | CI failed on existing tag; fix landed on main, rebuild same version |
| `npm run release -- --skip-tests` | Emergency retag only (avoid unless user insists) |
| `npm run release -- --no-wait` | Push tag only; don't wait for CI |
| `npm run release:publish` | CI finished but release stuck as draft |

## Retag after failed CI (common)

```bash
# After fixing workflow/code on main and pushing:
npm run release -- --retag
```

## Repo

- Remote: `https://github.com/davidthegnomad/gnomad-webcanvas`
- Workflow: `.github/workflows/release.yml`
- Releases auto-publish (`releaseDraft: false`), marked **prerelease** for beta tags

## Do NOT

- Ask the user to open GitHub Releases UI to publish manually
- Force-push tags
- Skip version alignment between `package.json` and `tauri.conf.json`

## On failure

```bash
gh run list --repo davidthegnomad/gnomad-webcanvas --workflow "Release Desktop Builds" --limit 3
gh run view <id> --repo davidthegnomad/gnomad-webcanvas --log-failed
```

Fix, push to `main`, then `npm run release -- --retag`.
