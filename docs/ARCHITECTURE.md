# Architecture — Gnomad Webcanvas

**Version:** 0.1.0-beta.2  
**Last updated:** June 2026

---

## System context

Gnomad Webcanvas is a **live HTML/CSS/JS editor** with instant preview. Users write code in Monaco panes, see output in a sandboxed iframe, and persist or share work via localStorage, native files, or URL hash.

```
┌──────────────────────────────────────────────────────────────────┐
│                     User (designer / developer)                   │
└────────────────────────────┬─────────────────────────────────────┘
                             │
         ┌───────────────────┴───────────────────┐
         │                                       │
         ▼                                       ▼
┌─────────────────────┐               ┌─────────────────────┐
│  Browser (Vite)     │               │  Tauri Desktop      │
│  localStorage       │               │  native dialogs     │
│  ZIP export         │               │  filesystem I/O     │
└──────────┬──────────┘               └──────────┬──────────┘
           │                                     │
           └──────────────┬──────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                   React 19 SPA (TypeScript)                       │
│  App · Workspace · TopNavbar · PreviewFrame · FloatingTools      │
│  Zustand store · platformBridge · parseHtmlFile · assembleSource · shareUrl │
│  preferences (theme persistence)                                              │
└────────────────────────────┬─────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
     Monaco Editor (3 panes)        Preview iframe (srcDoc)
     HTML · CSS · JS                 CDN libs · fonts · console
```

---

## Layer responsibilities

| Layer | Owns | Must not own |
|-------|------|----------------|
| **React UI** | Layout, editor UX, preview assembly, sharing | Direct filesystem without bridge |
| **Zustand store** | Code, projects, preview settings | Persistence format (delegated to utils) |
| **Platform bridge** | Open/Save abstraction | UI rendering |
| **Tauri plugins** | Native dialogs, file read/write | Editor logic |
| **Preview iframe** | User HTML/CSS/JS execution | Parent DOM access (sandboxed) |

---

## Component hierarchy

```
App
├── TopNavbar          — projects, templates, libraries, export, share
├── Workspace
│   ├── Group (react-resizable-panels)
│   │   ├── Panel[] — CodeEditorPane × 3 (html, css, js)
│   │   └── Panel — PreviewFrame
│   │       ├── iframe (assembled srcDoc)
│   │       └── ConsolePanel
│   └── ResizeHandle
└── FloatingTools
    ├── ColorPicker
    ├── CssGenerator
    └── FontPairings
```

---

## Data flow — live preview

```
User types in Monaco
        │
        ▼
editorStore.setCode(pane, code)     isDirty = true
        │
        ▼
useDebounce (500 ms)
        │
        ▼
assembleSource(html, css, js, libraries, fonts)
        │
        ▼
PreviewFrame sets iframe srcDoc
        │
        ▼
User JS runs in iframe ──postMessage──► ConsolePanel
```

**Force refresh:** `previewKey` increment bypasses debounce/cache when user presses Ctrl/Cmd+Enter.

**Pause:** When `previewPaused` is true, `assembledSource` returns null — iframe retains last rendered document.

---

## Data flow — persistence

### Web

```
editorStore change
        │
        ▼
App useEffect (debounce 1 s)
        │
        ▼
projectManager.saveProjectData(id, payload)
        │
        ▼
localStorage
```

### Desktop

```
Ctrl/Cmd+S
        │
        ▼
platformBridge.saveProject(html, css, js, path?)
        │
        ▼
assembleFullHtml() → writeTextFile via Tauri fs plugin
```

**Open:** Native dialog → `readTextFile` → `parseHtmlFile()` (DOMParser) extracts styles, inline scripts, and body HTML.

Implementation: `src/utils/parseHtmlFile.ts` — uses `DOMParser` + `querySelectorAll`, not regex. Covered by 8 unit tests.

---

## Hydration priority (startup)

On first mount, `App.tsx` loads state in order:

1. **URL hash** — shared link (`decodeProjectFromHash`)
2. **Legacy migration** — old localStorage keys → new project format
3. **Existing projects** — first project in index

Hash wins so shared links always load correctly even if local projects exist.

---

## Platform bridge

```typescript
interface PlatformBridge {
  isDesktop: boolean;
  openProject(): Promise<ProjectFileData | null>;
  saveProject(html, css, js, filePath?): Promise<string | null>;
  saveProjectAs(html, css, js): Promise<string | null>;
}
```

| Method | Web | Desktop |
|--------|-----|---------|
| `openProject` | Returns null | Open dialog → parse HTML |
| `saveProject` | Returns null | Write to path or prompt Save As |
| `saveProjectAs` | Returns null | Save dialog → write file |

Detection: `'__TAURI_INTERNALS__' in window`

---

## Share URL encoding

```
Project state → JSON → lz-string compress → URL hash
```

Payload fields: `html`, `css`, `js`, optional `libs`, `fp` (font pairing), `hf`/`bf` (custom fonts).

---

## Security boundary

| Surface | Trust level |
|---------|-------------|
| Editor UI | Trusted (app code) |
| Preview iframe | Untrusted (user code) — sandboxed, no parent access |
| CDN scripts | Third-party — user opt-in via library toggle |
| File I/O | User-selected paths only (Tauri dialog scope) |

See [SECURITY_MODEL.md](SECURITY_MODEL.md) for details.

---

## Tauri configuration

| Setting | Value |
|---------|-------|
| Product name | Gnomad Webcanvas |
| Identifier | `com.liveview.notepad` |
| Default window | 1400×900, min 800×500 |
| Bundle targets | all (deb, rpm, msi, dmg, etc.) |
| CSP | null (preview requires inline scripts) |

Capabilities grant fs read/write and dialog open/save on the main window only.

---

## Extension points

| Future feature | Likely touch points |
|----------------|---------------------|
| Custom Tauri commands | `src-tauri/src/lib.rs`, `platformBridge.ts` |
| Auto-updater | `tauri.conf.json` plugins, release workflow |
| Multi-file projects | `projectManager.ts`, Rust workspace commands |
| Collaboration | Backend or CRDT layer (not in v0.1) |

---

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙
