# Recommended Documentation — Portfolio & Production Readiness

**Status:** Core portfolio set **complete** (see [DOCS_INDEX.md](DOCS_INDEX.md)). All docs available as `.md`, `.html`, and `.txt` via `npm run docs:export`.

---

## Shipped in this repository

| Document | Purpose |
|----------|---------|
| [DOCS_INDEX.md](DOCS_INDEX.md) | Master index — all formats |
| [USER_GUIDE.md](USER_GUIDE.md) | End-user manual |
| [TECH_STACK.md](TECH_STACK.md) | Stack rationale |
| [BUILD.md](BUILD.md) | Phased delivery narrative |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System diagram + data flow |
| [SECURITY_MODEL.md](SECURITY_MODEL.md) | Trust boundary, file access |
| [PRIVACY.md](PRIVACY.md) | Data handling policy |
| [ROADMAP.md](ROADMAP.md) | v0.1 → v1.0 plan |
| [DEMO_SCRIPT.md](DEMO_SCRIPT.md) | 5–7 min live demo |
| [QA_CHECKLIST.md](QA_CHECKLIST.md) | Per-OS release QA |
| [BUILD_PLATFORMS.md](BUILD_PLATFORMS.md) | Build commands |
| [RELEASE_RUNBOOK.md](RELEASE_RUNBOOK.md) | Tag → CI → release checklist |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Support guide |
| [ACCESSIBILITY.md](ACCESSIBILITY.md) | Keyboard shortcuts and a11y status |
| [TEST_STRATEGY.md](TEST_STRATEGY.md) | Unit, integration, and QA layers | ✓ Vitest (19 tests) |
| [CROSS_PLATFORM_CHECKLIST.md](CROSS_PLATFORM_CHECKLIST.md) | Per-OS dev verification |
| [UI_DESIGN.md](UI_DESIGN.md) | Visual language and layout |

---

## Still recommended (not yet written)

| Document | Priority | Notes |
|----------|----------|-------|
| **CONTRIBUTING.md** | Open source | Contributor workflow |
| **ADR folder** (`docs/adr/`) | Engineering | Decision records |
| **ACCESSIBILITY_STATEMENT.md** | GA | Formal WCAG statement |
| **MACOS_NOTARIZATION.md** | Enterprise macOS | Apple notarization guide |
| **UPDATER.md** | In-app updates | Tauri updater when enabled |

---

## Regenerating HTML & TXT

Edit the `.md` source, then:

```bash
npm run docs:export
```

Script: `scripts/export-docs.mjs` · Theme: `docs/_assets/doc-theme.css`

---

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙
