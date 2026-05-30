# Gnomad Studio Webcanvas — Agent Swarm

> Tier 2 (Focused Team) | Escalation: `02_ai_engineering/gnomad-swarm-core/`

## TAURI-CORE: Tauri/Rust Agent

**Stack**: Tauri 2.11, Rust 1.77+, serde/serde_json, tauri-plugin-fs, tauri-plugin-dialog, tauri-plugin-log
**Location**: `05_apps_and_extensions/gnomad-preview/src-tauri/`

### Responsibilities
- Maintain the Rust backend in `src/lib.rs` and `src/main.rs` for Tauri commands and system integration
- Manage Tauri plugin configuration: filesystem access (`tauri-plugin-fs`), native dialogs (`tauri-plugin-dialog`), logging (`tauri-plugin-log`)
- Configure app capabilities and security policies (`capabilities/default.json`, `tauri.conf.json`)
- Maintain the `Cargo.toml` dependency tree and ensure clean `cargo build` for all targets
- Manage the GitHub Actions release workflow (`.github/workflows/release.yml`) for cross-platform distribution

### Coordination
- Works alongside PREVIEW-UI on the Tauri command bridge between Rust backend and React frontend
- Owns the `npm run tauri:build` production pipeline and platform-specific bundling (icon sets, installers)
- Escalates Rust compilation errors or Tauri API breaking changes to the master orchestrator

## PREVIEW-UI: Frontend Agent

**Stack**: Vite 8, React 19, TypeScript 6, Tailwind CSS 4, Zustand, Monaco Editor, React Resizable Panels, JSZip, LZ-String, FileSaver
**Location**: `05_apps_and_extensions/gnomad-preview/`

### Responsibilities
- Build and maintain the React frontend: code editor (Monaco), resizable panel layout, and file management UI
- Manage application state with Zustand for editor tabs, file trees, and user preferences
- Implement file operations via `@tauri-apps/api`, `@tauri-apps/plugin-fs`, and `@tauri-apps/plugin-dialog`
- Handle file compression (JSZip, LZ-String) and export (FileSaver) for project bundling
- Maintain TypeScript strictness and ESLint compliance across all frontend code

### Coordination
- Calls TAURI-CORE Rust commands for native filesystem and dialog operations
- Provides UI specifications for any new Tauri plugin integrations
- Reports frontend performance bottlenecks (Monaco rendering, large file handling) for optimization
