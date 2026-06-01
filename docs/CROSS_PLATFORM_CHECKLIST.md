# Cross-Platform Checklist — LiveView Notepad

Use when adding or changing UI, file I/O, or OS-facing behavior.

---

## Shared React bundle

The same `src/` code runs in **web** and **desktop** (Tauri WebView). Verify:

- [ ] Feature works in `npm run dev` (browser)
- [ ] Feature works in `npm run tauri:dev` (desktop)
- [ ] No hard dependency on Tauri APIs without `platformBridge` guard
- [ ] `isDesktop()` gates desktop-only shortcuts (Open, Save As)

---

## Platform matrix

| Feature | Web | macOS | Windows | Linux |
|---------|-----|-------|---------|-------|
| Live preview | ✓ | ✓ | ✓ | ✓ |
| localStorage projects | ✓ | ✓ | ✓ | ✓ |
| ZIP export | ✓ | ✓ | ✓ | ✓ |
| URL share | ✓ | ✓ | ✓ | ✓ |
| Open file | — | ✓ | ✓ | ✓ |
| Save / Save As | — | ✓ | ✓ | ✓ |
| Window title dirty | — | ✓ | ✓ | ✓ |

---

## Keyboard shortcuts

| Shortcut | macOS | Windows/Linux |
|----------|-------|---------------|
| Save | ⌘S | Ctrl+S |
| Open | ⌘O | Ctrl+O |
| Refresh | ⌘Enter | Ctrl+Enter |

Monaco may consume some bindings — test Save/Open do not conflict.

---

## File dialogs

Desktop file I/O uses Tauri `plugin-dialog`:

- [ ] Open filter: `.html`, `.htm`
- [ ] Save filter: `.html`
- [ ] Paths with spaces handled
- [ ] Cancel dialog → no error toast / crash

Test `parseHtmlFile()` with files saved from Chrome, VS Code, and LiveView itself.

---

## Before merge

```bash
npm run lint
npx tsc -b --noEmit
npm run build
```

If touching Tauri config or Rust:

```bash
cd src-tauri && cargo check
```

---

## Release verification

Full [QA_CHECKLIST.md](QA_CHECKLIST.md) on macOS, Windows, and Linux before publishing draft release.

---

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙
