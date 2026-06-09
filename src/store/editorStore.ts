import { create } from 'zustand';
import type {
  EditorState,
  EditorActions,
  PaneType,
  CDNLibrary,
  EditorTheme,
  ConsoleEntry,
  ProjectMeta,
  PreviewBackground,
} from '../types/editor.types';
import { loadPreferences, savePreferences } from '../utils/preferences';

const MAX_CONSOLE_ENTRIES = 200;
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 24;

export const DEFAULT_HTML = `<div class="container">
  <h1>Welcome to Webcanvas!</h1>
  <p>Start editing to see live changes.</p>
  <button id="counter-btn">Click me: 0</button>
</div>`;

export const DEFAULT_CSS = `body {
  font-family: system-ui, -apple-system, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #e2e8f0;
}

.container {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #818cf8, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

p {
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  background: #6366f1;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

button:hover {
  background: #4f46e5;
}

button:active {
  transform: scale(0.97);
}`;

export const DEFAULT_JS = `const btn = document.getElementById('counter-btn');
let count = 0;

btn.addEventListener('click', () => {
  count++;
  btn.textContent = \`Click me: \${count}\`;
});`;

const DEFAULT_PROJECT_ID = 'default';
const savedPrefs = loadPreferences();

export const useEditorStore = create<EditorState & EditorActions>((set) => ({
  htmlCode: DEFAULT_HTML,
  cssCode: DEFAULT_CSS,
  jsCode: DEFAULT_JS,
  activeLibraries: [],
  layoutOrientation: 'vertical',
  maximizedPane: null,
  activePane: 'html',
  previewPaused: false,
  previewKey: 0,

  editorTheme: savedPrefs.editorTheme,
  fontSize: 15,
  previewViewport: null,
  previewFullscreen: false,
  previewBackground: 'white' as PreviewBackground,

  consoleOpen: false,
  consoleEntries: [],
  consoleIdCounter: 0,

  currentProjectId: DEFAULT_PROJECT_ID,
  projects: [{ id: DEFAULT_PROJECT_ID, name: 'My Project', updatedAt: Date.now() }],
  projectVersion: 0,

  fontPairingId: null,
  customHeadingFont: null,
  customBodyFont: null,

  currentFilePath: null,
  isDirty: false,

  setCode: (pane: PaneType, code: string) => {
    const key = `${pane}Code` as const;
    set({ [key]: code, isDirty: true });
  },

  setLayoutOrientation: (orientation) => set({ layoutOrientation: orientation }),

  toggleLayout: () =>
    set((s) => ({
      layoutOrientation: s.layoutOrientation === 'vertical' ? 'horizontal' : 'vertical',
    })),

  setMaximizedPane: (pane) => set({ maximizedPane: pane }),
  setActivePane: (pane) => set({ activePane: pane }),

  toggleLibrary: (library: CDNLibrary) =>
    set((s) => {
      const exists = s.activeLibraries.some((l) => l.id === library.id);
      return {
        activeLibraries: exists
          ? s.activeLibraries.filter((l) => l.id !== library.id)
          : [...s.activeLibraries, library],
        isDirty: true,
        previewKey: s.previewKey + 1,
      };
    }),

  resetProject: () =>
    set({
      htmlCode: DEFAULT_HTML,
      cssCode: DEFAULT_CSS,
      jsCode: DEFAULT_JS,
      activeLibraries: [],
      maximizedPane: null,
      previewKey: 0,
      fontPairingId: null,
      customHeadingFont: null,
      customBodyFont: null,
      consoleEntries: [],
      consoleIdCounter: 0,
      isDirty: true,
    }),

  initializeStore: (data) =>
    set((s) => ({
      ...data,
      isDirty: false,
      previewKey: s.previewKey + 1,
      projectVersion: s.projectVersion + 1,
    })),

  togglePreviewPaused: () => set((s) => ({ previewPaused: !s.previewPaused })),
  forceRefreshPreview: () =>
    set((s) => ({ previewKey: s.previewKey + 1, consoleEntries: [], consoleIdCounter: 0 })),

  setEditorTheme: (theme: EditorTheme) => {
    savePreferences({ editorTheme: theme });
    set({ editorTheme: theme });
  },

  setFontSize: (size: number) =>
    set({ fontSize: Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, size)) }),

  increaseFontSize: () =>
    set((s) => ({ fontSize: Math.min(MAX_FONT_SIZE, s.fontSize + 1) })),

  decreaseFontSize: () =>
    set((s) => ({ fontSize: Math.max(MIN_FONT_SIZE, s.fontSize - 1) })),

  setPreviewViewport: (width) => set({ previewViewport: width }),

  togglePreviewFullscreen: () =>
    set((s) => ({ previewFullscreen: !s.previewFullscreen })),

  cyclePreviewBackground: () =>
    set((s) => {
      const order: PreviewBackground[] = ['white', 'dark', 'checkerboard'];
      const idx = order.indexOf(s.previewBackground);
      return { previewBackground: order[(idx + 1) % order.length] };
    }),

  toggleConsole: () => set((s) => ({ consoleOpen: !s.consoleOpen })),

  addConsoleEntry: (method: ConsoleEntry['method'], args: string[]) =>
    set((s) => {
      const newId = s.consoleIdCounter + 1;
      const entry: ConsoleEntry = { id: newId, method, args, timestamp: Date.now() };
      const entries = [...s.consoleEntries, entry];
      return {
        consoleEntries: entries.length > MAX_CONSOLE_ENTRIES
          ? entries.slice(-MAX_CONSOLE_ENTRIES)
          : entries,
        consoleIdCounter: newId,
      };
    }),

  clearConsole: () => set({ consoleEntries: [], consoleIdCounter: 0 }),

  setCurrentProject: (id) => set({ currentProjectId: id }),

  updateProjectsMeta: (projects: ProjectMeta[]) => set({ projects }),

  bumpProjectVersion: () => set((s) => ({ projectVersion: s.projectVersion + 1 })),

  setFontPairing: (id) =>
    set({ fontPairingId: id, customHeadingFont: null, customBodyFont: null }),

  setCustomFonts: (heading, body) =>
    set({ fontPairingId: null, customHeadingFont: heading, customBodyFont: body }),

  clearFontPairing: () =>
    set({ fontPairingId: null, customHeadingFont: null, customBodyFont: null }),

  setCurrentFilePath: (path) => set({ currentFilePath: path }),
  setDirty: (dirty) => set({ isDirty: dirty }),
}));
