import type { editor } from 'monaco-editor';

export const EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  fontSize: 15,
  fontFamily: 'JetBrains Mono, Fira Code, monospace',
  wordWrap: 'on',
  automaticLayout: true,
  formatOnPaste: true,
  formatOnType: true,
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  tabSize: 2,
  bracketPairColorization: { enabled: true },
  guides: { bracketPairs: true, indentation: true },
  padding: { top: 12 },
  lineNumbers: 'on',
  renderLineHighlight: 'line',
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
};

export const LANGUAGE_MAP = {
  html: 'html',
  css: 'css',
  js: 'javascript',
} as const;

export const PANE_LABELS = {
  html: 'HTML',
  css: 'CSS',
  js: 'JS',
} as const;

export const PANE_COLORS = {
  html: '#e34c26',
  css: '#264de4',
  js: '#f7df1e',
} as const;
