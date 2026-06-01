# Accessibility — Gnomad Webcanvas

**Version:** 0.1.0-beta.2  
**Last updated:** June 2026  
**Status:** Partial — keyboard shortcuts, Monaco themes, and shell light/dark/hc modes shipped; full WCAG audit pending

---

## Theme & visual accessibility

The **Theme** selector in the navbar sets both:

- **Monaco editor theme** (`vs-dark`, `vs-light`, `hc-black`)
- **Application shell theme** via CSS variables (`data-ui-theme` on `<html>`)

| Editor theme | Shell mode | Use case |
|--------------|------------|----------|
| Dark | `dark` | Default low-light editing |
| Light | `light` | Bright environments |
| High Contrast | `hc` | Maximum contrast (yellow accent on black) |

Theme preference persists in `localStorage` (`liveview-preferences`).

Preview background modes (white / dark / checkerboard) are independent and help test user content contrast.

Gnomad Webcanvas supports full keyboard workflows for common actions without requiring a pointer.

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd+S` | Save |
| `Ctrl/Cmd+Shift+S` | Save As / Export |
| `Ctrl/Cmd+O` | Open (desktop) |
| `Ctrl/Cmd+Enter` | Refresh preview |
| `Ctrl/Cmd+\` | Toggle layout |
| `Ctrl/Cmd+1/2/3` | Focus HTML/CSS/JS pane |
| `Ctrl/Cmd++` / `-` | Font size |
| `Ctrl/Cmd+Shift+F` | Format pane |
| `Ctrl/Cmd+Shift+C` | Toggle console |
| `Ctrl/Cmd+Shift+E` | Export ZIP |
| `Escape` | Exit preview fullscreen |

Full list available in the **Shortcuts** modal (navbar).

---

## Monaco editor

Monaco inherits VS Code accessibility features when focused:

- Screen reader support for code content
- Standard text editing shortcuts
- Syntax highlighting with high-contrast theme option

Select **High Contrast** in the theme dropdown for improved visibility.

---

## Focus management

| Area | Status |
|------|--------|
| Navbar buttons | Focusable; native `<button>` elements |
| Pane headers | Click to activate; maximize button focusable |
| Floating tools | Interactive controls in tab order |
| Shortcuts modal | Closes on Escape (Monaco may capture first) |
| Preview iframe | Separate focus context — Tab enters iframe content |

---

## Color & contrast

| Element | Notes |
|---------|-------|
| Editor + shell chrome | Dark, light, and high-contrast themes via CSS variables |
| Pane indicators | Color + text label (HTML/CSS/JS) — not color-only |
| Preview backgrounds | White, dark, and checkerboard modes for content testing |

Formal contrast ratios not yet audited against WCAG 2.2 AA.

---

## Known gaps

| Gap | Planned |
|-----|---------|
| Skip link to main content | v1.0 |
| ARIA labels on all icon-only buttons | v0.2 |
| Focus trap in modals | v0.2 |
| Screen reader announcements for preview updates | v1.0 |
| Reduced motion preference | v0.3 |
| Colorblind-specific palette | v0.3 |

---

## Testing checklist

Manual pass before GA:

- [ ] Tab through navbar without trap
- [ ] Operate all menus with keyboard (where supported)
- [ ] High contrast theme readable
- [ ] VoiceOver (macOS) / NVDA (Windows) on navbar + Monaco
- [ ] Preview fullscreen exit via Escape

---

## Feedback

Accessibility issues: report via project tracker or [Gnomad Studio](https://gnomadstudio.org).

---

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙
