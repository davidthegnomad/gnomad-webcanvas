# Project SOP — gnomad-preview (Gnomad Webcanvas)

> Tauri v2 + Vite + React + TypeScript desktop application — a live code editor with Monaco.
> **Self-Evolving**: Agents update this file when processes change. See Self-Evolution Protocol.

---

## Environment Setup

```bash
# Navigate to project
cd 05_apps_and_extensions/gnomad-preview

# Install frontend dependencies
npm install

# Install Tauri CLI (included in devDependencies)
# Rust toolchain required — ensure `rustup` and stable Rust >= 1.77.2 are installed

# Environment variables
# Copy from VAULT or .env.example if applicable:
# cp .env.example .env
```

## Development

```bash
# Start Vite dev server (frontend only)
npm run dev

# Start Tauri dev mode (frontend + native shell)
npm run tauri:dev

# Frontend runs at: http://localhost:5173 (Vite default)
```

### Key Directories
| Directory | Purpose |
|-----------|---------|
| `src/` | React frontend source (TypeScript + Tailwind) |
| `src-tauri/` | Tauri/Rust backend (Cargo.toml, commands, plugins) |
| `src/utils/__tests__/` | Vitest unit tests (parseHtmlFile, shareUrl, assembleSource) |
| `docs/` | Portfolio documentation (MD source; export to HTML/TXT) |
| `public/` | Static assets served by Vite |

### Key Dependencies
- **Frontend**: React 19, Monaco Editor, Zustand (state), Tailwind CSS v4, react-resizable-panels
- **Tauri Plugins**: fs, dialog, log
- **Testing**: Vitest + jsdom (19 unit tests)
- **Utilities**: JSZip, FileSaver, lz-string (compression), DOMParser (file open)

### Code Conventions
- TypeScript strict mode via `tsc -b`
- Tailwind CSS for styling
- Zustand for state management
- ESLint for linting

## Testing

```bash
# Run linting
npm run lint

# Unit tests (Vitest)
npm run test

# TypeScript type checking
npx tsc -b --noEmit
```

### Pre-Commit Checklist
- [ ] No linter errors/warnings (`npm run lint`)
- [ ] Unit tests pass (`npm run test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Tauri build succeeds (`npm run tauri:build`)
- [ ] SESSION_STATE.md is updated

## Deployment

```bash
# Build frontend for production
npm run build

# Build Tauri desktop app (produces installer)
npm run tauri:build
```

### Deployment Targets
| Environment | Platform | Branch/Trigger |
|-------------|----------|----------------|
| Desktop | Tauri (Linux/macOS/Windows) | `npm run release` → `v*` tag |
| Web docs + app | GitHub Pages | push to `main` |

```bash
npm run release              # tag, wait for CI, publish GitHub Release
npm run release -- --retag   # rebuild same version after CI fix
```

### Post-Deploy Checklist
- [ ] Verify installer/binary works
- [ ] Update SESSION_STATE.md

## Troubleshooting

### Common Issues
| Issue | Fix |
|-------|-----|
| Rust not found | Install via `rustup` — `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Tauri build fails | Check `src-tauri/Cargo.toml` deps, run `cargo check` in src-tauri/ |
| Vite HMR not working in Tauri | Ensure `tauri.conf.json` devUrl points to Vite dev server |

### Emergency Procedures
- **Rollback**: Revert git commits; no remote deploy to roll back
- **Logs**: Check Tauri plugin-log output, browser devtools for frontend
- **Escalation**: Report to `02_ai_engineering/gnomad-swarm-core/`

---

*This SOP is a living document. Update it whenever processes change.*
