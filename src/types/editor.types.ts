export type PaneType = 'html' | 'css' | 'js';

export type LayoutOrientation = 'horizontal' | 'vertical';

export type EditorTheme = 'vs-dark' | 'vs-light' | 'hc-black';

export interface CDNLibrary {
  id: string;
  name: string;
  category: 'css' | 'js';
  version: string;
  tag: string;
}

export interface ConsoleEntry {
  id: number;
  method: 'log' | 'warn' | 'error' | 'info';
  args: string[];
  timestamp: number;
}

export interface ProjectMeta {
  id: string;
  name: string;
  updatedAt: number;
}

export interface FontPairingPreset {
  id: string;
  name: string;
  description: string;
  headingFont: string;
  bodyFont: string;
  category: 'sans' | 'serif' | 'mixed' | 'display';
}

export interface ActiveFontPairing {
  headingFont: string;
  bodyFont: string;
}

export type PreviewBackground = 'white' | 'dark' | 'checkerboard';

export interface EditorState {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  activeLibraries: CDNLibrary[];
  layoutOrientation: LayoutOrientation;
  maximizedPane: PaneType | null;
  activePane: PaneType;
  previewPaused: boolean;
  previewKey: number;

  editorTheme: EditorTheme;
  fontSize: number;
  previewViewport: number | null;
  previewFullscreen: boolean;
  previewBackground: PreviewBackground;

  consoleOpen: boolean;
  consoleEntries: ConsoleEntry[];
  consoleIdCounter: number;

  currentProjectId: string;
  projects: ProjectMeta[];
  projectVersion: number;

  fontPairingId: string | null;
  customHeadingFont: string | null;
  customBodyFont: string | null;

  currentFilePath: string | null;
  isDirty: boolean;
}

export interface EditorActions {
  setCode: (pane: PaneType, code: string) => void;
  setLayoutOrientation: (orientation: LayoutOrientation) => void;
  toggleLayout: () => void;
  setMaximizedPane: (pane: PaneType | null) => void;
  setActivePane: (pane: PaneType) => void;
  toggleLibrary: (library: CDNLibrary) => void;
  resetProject: () => void;
  initializeStore: (data: Partial<Pick<EditorState, 'htmlCode' | 'cssCode' | 'jsCode' | 'activeLibraries' | 'fontPairingId' | 'customHeadingFont' | 'customBodyFont'>>) => void;
  togglePreviewPaused: () => void;
  forceRefreshPreview: () => void;

  setEditorTheme: (theme: EditorTheme) => void;
  setFontSize: (size: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  setPreviewViewport: (width: number | null) => void;
  togglePreviewFullscreen: () => void;
  cyclePreviewBackground: () => void;

  toggleConsole: () => void;
  addConsoleEntry: (method: ConsoleEntry['method'], args: string[]) => void;
  clearConsole: () => void;

  setCurrentProject: (id: string) => void;
  updateProjectsMeta: (projects: ProjectMeta[]) => void;
  bumpProjectVersion: () => void;

  setFontPairing: (id: string | null) => void;
  setCustomFonts: (heading: string | null, body: string | null) => void;
  clearFontPairing: () => void;

  setCurrentFilePath: (path: string | null) => void;
  setDirty: (dirty: boolean) => void;
}
