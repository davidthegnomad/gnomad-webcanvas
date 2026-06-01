# Demo Script — LiveView Notepad

**Duration:** 5–7 minutes  
**Audience:** Designers, front-end developers, technical reviewers  
**Version:** 0.1.0

---

## Setup (before demo)

- [ ] App running: `npm run tauri:dev` (desktop) or `npm run dev` (web)
- [ ] Browser zoom 100%; window ~1400×900
- [ ] Default "Hello, LiveView!" template loaded
- [ ] Close unrelated apps/notifications

---

## 1. Hook (30 sec)

> "LiveView Notepad is a live HTML/CSS/JS playground — edit code on the left, see results instantly on the right. It runs in the browser and as a native desktop app with Open/Save."

Click the counter button in preview to show interactivity.

---

## 2. Live editing (1 min)

1. In **HTML**, change the heading text
2. In **CSS**, change the gradient colors on `h1`
3. Point out **debounced preview** — no manual refresh needed
4. Toggle **Pause**, edit silently, then **Refresh**

> "Preview is debounced so we don't reload on every keystroke, but you can pause for heavy JS work."

---

## 3. Layout & panes (45 sec)

1. Toggle **vertical ↔ horizontal** layout (`Ctrl/Cmd+\`)
2. Maximize the CSS pane (double-click header)
3. Restore, switch focus with `Ctrl/Cmd+1/2/3`

---

## 4. Templates & libraries (1 min)

1. Open **Templates** → select **Landing Page**
2. Show instant preview swap
3. Open **Libraries** → enable **Tailwind CSS**
4. Add a Tailwind class to HTML (e.g. `class="text-4xl font-bold"`)

> "Templates jump-start projects; CDN libraries inject with one click."

---

## 5. Designer tools (45 sec)

1. **Font Pairings** — apply a heading/body pair; show Google Fonts in preview
2. **Color Picker** — pick a color, insert into CSS
3. Cycle **preview background** to checkerboard for transparency demo
4. Switch viewport to **Mobile (375px)**

---

## 6. Console & debugging (30 sec)

1. Add `console.log('Hello from preview')` in JS
2. Open **Console panel** (`Ctrl/Cmd+Shift+C`)
3. Show log capture from iframe

---

## 7. Export & share (1 min)

1. Click **Export** — show ZIP contents (index.html, style.css, script.js)
2. Click **Share** — paste URL in incognito tab; project loads from hash

> "Export for deployment; share for quick demos without a server."

---

## 8. Desktop file I/O (30 sec, Tauri only)

1. **Save As** → save `demo.html`
2. Reset project, then **Open** the saved file
3. Point out window title with filename

Skip this section in web-only demos.

---

## 9. Close (30 sec)

> "LiveView Notepad is part of the Gnomad Studio apps portfolio — lightweight, local-first, and built with Tauri and React. Docs and roadmap are in the repo under `docs/`."

---

## Q&A prep

| Question | Answer |
|----------|--------|
| vs CodePen/JSFiddle? | Local-first, desktop Open/Save, no account, ZIP export |
| vs VS Code Live Preview? | Integrated Monaco + tools + share URL in one app |
| Backend? | None in v0.1 — all client-side |
| Mobile app? | Not planned; responsive web works on tablets |

---

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙
