# QA Checklist — Gnomad Webcanvas

Use before publishing a release. Check each item on **at least one platform**; full releases require macOS, Windows, and Linux passes.

**Version under test:** __________  
**Tester:** __________  
**Date:** __________

---

## Install & launch

- [ ] App launches without crash (desktop) or loads in browser (web)
- [ ] Default template renders in preview
- [ ] Window size respects minimum (800×500 desktop)
- [ ] No console errors on fresh launch

---

## Editor

- [ ] HTML/CSS/JS panes accept input with syntax highlighting
- [ ] Pane focus shortcuts (`Ctrl/Cmd+1/2/3`) work
- [ ] Maximize/restore pane (double-click header)
- [ ] Resize handles drag smoothly
- [ ] Layout toggle (vertical ↔ horizontal)
- [ ] Font size increase/decrease
- [ ] Editor theme switch (dark/light/high contrast)
- [ ] Shell UI updates with editor theme (navbar, panels, tools bar)
- [ ] Theme preference persists after reload

---

## Preview

- [ ] Live update after typing (500 ms debounce)
- [ ] Force refresh (`Ctrl/Cmd+Enter`)
- [ ] Pause preview stops updates
- [ ] Viewport presets (Full, Mobile, Tablet, Desktop)
- [ ] Background cycle (white/dark/checkerboard)
- [ ] Fullscreen preview + Escape to exit
- [ ] Console captures log/warn/error from iframe

---

## Projects & templates

- [ ] Create new project
- [ ] Rename project
- [ ] Delete project (non-last)
- [ ] Switch between projects preserves code
- [ ] Apply template replaces code
- [ ] Reset project with confirmation
- [ ] Persistence survives app restart (web: localStorage; desktop: relaunch)

---

## Libraries & tools

- [ ] Toggle CDN library updates preview
- [ ] Export ZIP includes active library tags
- [ ] Color picker inserts into CSS
- [ ] Font pairing applies to preview
- [ ] CSS generator inserts snippet

---

## Export & share

- [ ] Export ZIP downloads valid archive (index.html, style.css, script.js)
- [ ] Exported page opens correctly in browser
- [ ] Share copies URL to clipboard
- [ ] Shared URL loads project in new tab/window

---

## Desktop file I/O (Tauri only)

- [ ] Open `.html` file populates panes (including externally edited files)
- [ ] Save writes file; dirty indicator clears
- [ ] Save As prompts dialog; updates path
- [ ] Window title shows filename and `*` when dirty
- [ ] `Ctrl/Cmd+O`, `Ctrl/Cmd+S`, `Ctrl/Cmd+Shift+S` shortcuts

---

## Keyboard shortcuts

- [ ] Shortcuts modal opens from navbar
- [ ] All documented shortcuts functional
- [ ] No conflict with Monaco internal shortcuts (Save, etc.)

---

## Regression smoke (5 min)

1. Edit HTML → preview updates
2. Add CSS → styling appears
3. Add JS click handler → works in preview
4. Export ZIP → open in Chrome/Firefox
5. Share URL → open in incognito

---

## Sign-off

| Platform | Pass/Fail | Notes |
|----------|-----------|-------|
| macOS | | |
| Windows | | |
| Linux | | |
| Web (Chrome) | | |
| Web (Firefox) | | |

---

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙
