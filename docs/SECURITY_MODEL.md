# Security Model — Gnomad Webcanvas

**Version:** 0.1.0-alpha.1 (Windows) / 0.1.0-beta.6 (Linux & macOS)  
**Last updated:** June 2026

---

## Trust boundaries

Gnomad Webcanvas executes **user-authored HTML, CSS, and JavaScript** in a preview iframe. The app itself is trusted; user code is untrusted.

```
┌─────────────────────────────────────────┐
│  Trusted: React UI, Monaco, Zustand   │
│  Trusted: Tauri shell, dialog, IPC      │
├─────────────────────────────────────────┤
│  User-selected: local files (desktop)   │
├─────────────────────────────────────────┤
│  Untrusted: preview iframe (user code)  │
│  Third-party: CDN libraries (opt-in)    │
└─────────────────────────────────────────┘
```

---

## Preview sandbox

| Control | Implementation |
|---------|----------------|
| User JS isolation | iframe with `srcDoc` — separate document context |
| No parent DOM access | iframe sandbox; no direct `window.parent` manipulation expected |
| Console relay | postMessage with typed `liveview-console` events only |

**Limitation:** iframe sandbox attributes are not maximally restrictive because inline scripts and styles are required for live preview. Treat preview as running arbitrary code.

---

## Filesystem access (desktop)

| Rule | Detail |
|------|--------|
| Scope | User-selected paths via native Open/Save dialogs or validated absolute paths |
| Permissions | **No** `fs:allow-read-text-file` / `fs:allow-write-*` in capabilities |
| IPC commands | `read_text_file_path`, `write_text_file_path`, `write_binary_file_path` |
| Path policy | `path_guard.rs` — home/temp allowlists, blocked system dirs, extension allowlists |
| Windows | Component-wise path checks (`USERPROFILE` via `dirs` crate); no string-prefix bypass |

Tauri capability file: `src-tauri/capabilities/default.json`

---

## Network exposure

| Source | Network |
|--------|---------|
| User JS in preview | Can fetch any URL (browser/WebView network stack) |
| CDN libraries | Loaded when user toggles libraries (known registry in `cdnRegistry.ts`) |
| Monaco editor | Bundled locally in desktop builds |
| App backend | GitHub API for beta updater manifest lookup only |
| App shell | Updater endpoints in `tauri.conf.json` |

**Recommendation:** Do not enter secrets (API keys, tokens) in editor panes if sharing URLs or exporting ZIPs.

---

## Data storage

| Data | Location | Sensitivity |
|------|----------|-------------|
| Project code (web) | localStorage | Local only; survives browser restarts |
| Project code (desktop) | User-chosen files on disk | User-controlled |
| Share URLs | URL hash | Visible in browser history and referrer logs |

See [PRIVACY.md](PRIVACY.md).

---

## Content Security Policy

`tauri.conf.json` sets an explicit CSP for the main shell:

- `script-src 'self' 'wasm-unsafe-eval'` (no `unsafe-inline` on scripts)
- `style-src 'self' 'unsafe-inline'` (Tailwind / UI)
- Preview iframe uses its own `sandbox` attribute

---

## Threat summary

| Threat | Mitigation | Residual risk |
|--------|------------|---------------|
| Malicious user JS in preview | iframe isolation | User runs own code deliberately |
| XSS via shared URL | Recipient loads attacker-crafted hash | Only open links from trusted sources |
| CDN supply chain | Curated registry; user opt-in | CDN compromise could affect preview |
| Path traversal on Open/Save | `path_guard` + dialog paths | Low when using desktop builds ≥ alpha.1 |
| Unrestricted FS from WebView | FS plugin writes removed; IPC only | Low |
| Unsigned desktop updates | Updater minisign + pubkey in config | Unsigned Windows installer until code signing configured |

---

## Pre-release checklist

- [x] No secrets in source or default templates
- [x] Tauri capabilities minimal (dialog + IPC commands only)
- [x] CDN registry URLs use HTTPS
- [x] Share URL payload contains no automatic network callbacks
- [ ] Windows code signing (SmartScreen) — optional CI secrets
- [ ] macOS notarization — optional CI secrets

---

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙
