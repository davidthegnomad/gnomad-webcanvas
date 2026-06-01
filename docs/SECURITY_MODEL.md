# Security Model — Gnomad Webcanvas

**Version:** 0.1.0-beta.2  
**Last updated:** June 2026

---

## Trust boundaries

Gnomad Webcanvas executes **user-authored HTML, CSS, and JavaScript** in a preview iframe. The app itself is trusted; user code is untrusted.

```
┌─────────────────────────────────────────┐
│  Trusted: React UI, Monaco, Zustand     │
│  Trusted: Tauri shell, dialog, fs       │
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
| Scope | User-selected paths via native Open/Save dialogs only |
| Permissions | `fs:allow-read-text-file`, `fs:allow-write-text-file` in capabilities |
| No directory traversal | App does not browse filesystem outside dialog results |

Tauri capability file: `src-tauri/capabilities/default.json`

---

## Network exposure

| Source | Network |
|--------|---------|
| User JS in preview | Can fetch any URL (browser/WebView network stack) |
| CDN libraries | Loaded when user toggles libraries (known registry in `cdnRegistry.ts`) |
| Monaco editor | Loads from CDN in development |
| App backend | None — no server component in v0.1 |

**Recommendation:** Do not enter secrets (API keys, tokens) in editor panes if sharing URLs or exporting ZIPs.

---

## Data storage

| Data | Location | Sensitivity |
|------|----------|-------------|
| Project code (web) | localStorage | Local only; survives browser restarts |
| Project code (desktop) | User-chosen `.html` files | User-controlled |
| Share URLs | URL hash | Visible in browser history and referrer logs |

See [PRIVACY.md](PRIVACY.md).

---

## Content Security Policy

`tauri.conf.json` sets `csp: null` to allow inline scripts in the WebView for preview assembly. This is acceptable because the app loads local bundled assets — not arbitrary remote HTML as the shell document.

---

## Threat summary

| Threat | Mitigation | Residual risk |
|--------|------------|---------------|
| Malicious user JS in preview | iframe isolation | User runs own code deliberately |
| XSS via shared URL | Recipient loads attacker-crafted hash | Only open links from trusted sources |
| CDN supply chain | Curated registry; user opt-in | CDN compromise could affect preview |
| Path traversal on Save | Dialog-scoped paths only | Low |
| localStorage exfiltration | Same-origin policy | Other scripts on same origin could read (web hosting) |

---

## Pre-release checklist

- [ ] No secrets in source or default templates
- [ ] Tauri capabilities minimal (fs + dialog only)
- [ ] CDN registry URLs use HTTPS
- [ ] Share URL payload contains no automatic network callbacks
- [ ] Release binaries built from tagged CI commits

---

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙
