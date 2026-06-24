════════════════════════════════════════════════════════════════════════
  GNOMAD WEBCANVAS
  Gnomad Webcanvas · README.md
════════════════════════════════════════════════════════════════════════

GNOMAD WEBCANVAS
================

Beta
Version-818cf8)
Platforms

Gnomad Webcanvas is a live HTML/CSS/JS playground with Monaco editing, instant iframe preview, project export, URL sharing, and native Open/Save on desktop — built with Tauri and React.

Built with ❤️ by Gnomad Studio 🦙

Live project site: davidthegnomad.github.io/gnomad-webcanvas · Play in browser: app

────────────────────────────────────────

WHY THIS EXISTS
---------------

Quick UI experiments shouldn't require spinning up a dev server or switching to an online sandbox. Gnomad Webcanvas gives you three synchronized editor panes, a live preview, designer tools (colors, fonts, CSS snippets), and one-click ZIP export — running locally in the browser or as a native desktop app.

────────────────────────────────────────

CAPABILITIES (V0.1.0)
---------------------

  Area       |  What you get                                                                 
  Editor     |  Monaco HTML/CSS/JS panes, resizable layout, dark/light/hc themes             
  Preview    |  Live iframe, viewport presets, console capture, fullscreen                   
  Projects   |  Multi-project localStorage, starter templates                                
  Libraries  |  Toggle CDN libs (Tailwind, GSAP, Three.js, …)                                
  Tools      |  Color picker, CSS generator, font pairings                                   
  Export     |  ZIP download (index.html + style.css + script.js)                            
  Share      |  LZ-compressed URL hash — no backend                                          
  Desktop    |  Tauri Open/Save (DOMParser file parsing), window title + dirty indicator     
  Testing    |  Vitest unit tests (32) for parser, share URL, preview assembler, path helpers
  Platform   |  Linux & macOS beta.6; Windows alpha.1; web via Vite                          

────────────────────────────────────────

QUICK START
-----------

End users

  1. Download installer from GitHub Releases (when published), or run from source below.
  2. Edit HTML/CSS/JS — preview updates automatically.
  3. Read the full manual: docs/USER_GUIDE.html or docs/USER_GUIDE.txt.

Developers

Prerequisites: Node.js LTS, Rust stable, Tauri v2 platform deps

  [bash]
    cd 05_apps_and_extensions/gnomad-preview
    npm install
    npm run dev          # Web: http://localhost:5173
    npm run tauri:dev    # Desktop shell + Vite HMR
    npm run test         # Vitest unit tests (32)
    npm run lint         # ESLint
    npm run tauri:build:linux    # Linux beta
    npm run tauri:build:macos    # macOS beta
    npm run tauri:build:windows  # Windows alpha (NSIS)

Production build:

  [bash]
    npm run build
    npm run tauri:build:linux   # or :macos / :windows

────────────────────────────────────────

ARCHITECTURE (SUMMARY)
----------------------

  [code]
    ┌─────────────────────────────────────────────────────────┐
    │  React 19 UI (Monaco, preview iframe, floating tools)   │
    └───────────────────────────┬─────────────────────────────┘
                                │ platformBridge (web vs Tauri)
    ┌───────────────────────────▼─────────────────────────────┐
    │  Tauri 2: guarded IPC file commands + native dialogs │
    └─────────────────────────────────────────────────────────┘

Deep dive: docs/TECH_STACK.md · docs/ARCHITECTURE.md

────────────────────────────────────────

DOCUMENTATION INDEX
-------------------

All docs ship as Markdown (source), HTML (browser), and TXT (Notepad/Word). Full index: docs/DOCS_INDEX.md. Regenerate: npm run docs:export.

  Document          |  MD                       |  HTML                       |  TXT                     
  All docs (index)  |  docs/DOCS_INDEX.md       |  docs/DOCS_INDEX.html       |  docs/DOCS_INDEX.txt     
  Project site      |  —                        |  docs/index.html            |  —                       
  User Guide        |  docs/USER_GUIDE.md       |  docs/USER_GUIDE.html       |  docs/USER_GUIDE.txt     
  Tech Stack        |  docs/TECH_STACK.md       |  docs/TECH_STACK.html       |  docs/TECH_STACK.txt     
  Architecture      |  docs/ARCHITECTURE.md     |  docs/ARCHITECTURE.html     |  docs/ARCHITECTURE.txt   
  Build Platforms   |  docs/BUILD_PLATFORMS.md  |  docs/BUILD_PLATFORMS.html  |  docs/BUILD_PLATFORMS.txt
  Roadmap           |  docs/ROADMAP.md          |  docs/ROADMAP.html          |  docs/ROADMAP.txt        
  Test Strategy     |  docs/TEST_STRATEGY.md    |  docs/TEST_STRATEGY.html    |  docs/TEST_STRATEGY.txt  
  Accessibility     |  docs/ACCESSIBILITY.md    |  docs/ACCESSIBILITY.html    |  docs/ACCESSIBILITY.txt  
  Changelog         |  CHANGELOG.md             |  CHANGELOG.html             |  CHANGELOG.txt           

────────────────────────────────────────

CI / RELEASES
-------------

GitHub Actions builds macOS, Linux, and Windows on tagged v* releases. See docs/RELEASE_RUNBOOK.md.

────────────────────────────────────────

LICENSE
-------

Private project — see repository settings. Contact Gnomad Studio for licensing inquiries.

────────────────────────────────────────

ACKNOWLEDGMENTS
---------------

Built with Tauri, React, Monaco Editor, and Vite.

════════════════════════════════════════════════════════════════════════
Built with ❤️ by Gnomad Studio 🦙
https://gnomadstudio.org
════════════════════════════════════════════════════════════════════════
