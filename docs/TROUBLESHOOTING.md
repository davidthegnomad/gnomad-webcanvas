# Troubleshooting — Gnomad Webcanvas

Quick fixes for common issues. For full usage, see [USER_GUIDE.md](USER_GUIDE.md).

---

## Editor & preview

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Preview not updating | Preview paused | Click **Refresh** or unpause in navbar |
| Preview blank after edit | JS error in user code | Open console panel (`Ctrl/Cmd+Shift+C`); fix script |
| Preview stale | Debounce delay | Press `Ctrl/Cmd+Enter` to force refresh |
| Monaco not loading | Network blocked CDN | Check connectivity; Monaco loads from CDN in dev |
| Layout panels stuck | Maximized pane | Double-click pane header to restore |
| Font pairing not applied | No pairing selected | Choose a pairing in floating tools bar |

---

## Projects & persistence

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Work lost on refresh (web) | Private/incognito mode | Use normal browsing; localStorage disabled in private mode |
| "Quota exceeded" silent fail | localStorage full | Export ZIP; delete old projects |
| Wrong project loads | URL hash present | Clear hash from URL or use Share intentionally |
| Legacy data not migrated | Already migrated once | Check Projects menu for saved projects |

---

## Desktop file operations

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Open does nothing | Cancelled dialog or not desktop | Use `Ctrl/Cmd+O`; ensure Tauri build not web tab |
| Save writes empty file | Race before hydration | Wait for editor to load; try again |
| CSS/JS missing after Open | Non-standard HTML structure | Ensure `<style>`, inline `<script>`, and `<body>` present; parser uses DOMParser |
| Permission denied on Save | OS sandbox / read-only path | Save As to a writable location |

---

## Export & share

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| ZIP download blocked | Browser pop-up blocker | Allow downloads for the site |
| Share URL too long | Large project in hash | Export ZIP instead; some browsers limit URL length |
| Shared link loads empty | Truncated URL | Re-copy full URL; avoid messaging apps that shorten links |
| CDN libs missing in export | Libraries not toggled on | Enable libraries before export |

---

## Build & development

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `tauri dev` fails | Rust not installed | Install via [rustup.rs](https://rustup.rs) |
| Linux build missing deps | webkit2gtk not installed | See [BUILD_PLATFORMS.md](BUILD_PLATFORMS.md) |
| Vite port conflict | 5173 in use | Kill other process or change port in `vite.config.ts` |
| Tauri HMR broken | devUrl mismatch | Confirm `tauri.conf.json` → `devUrl` is `http://localhost:5173` |
| `npm run lint` errors | TypeScript/ESLint drift | Fix reported files; run `npx tsc -b --noEmit` |
| `npm run test` fails | Parser/share/assembler regression | Check `src/utils/__tests__/` output; see [TEST_STRATEGY.md](TEST_STRATEGY.md) |

---

## CI / release

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Release workflow skipped | Tag format wrong | Use `v*` tags (e.g. `v0.1.0`) |
| Draft release empty | Build failed on matrix | Check Actions logs per OS |
| macOS build fails on CI | Xcode/Rust toolchain | Re-run job; verify `tauri-action` version |

---

## Getting more help

- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- Agent swarm: [AGENTS.md](../AGENTS.md)
- Escalation: `02_ai_engineering/gnomad-swarm-core/`

---

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙
