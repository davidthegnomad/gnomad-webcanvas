import { useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';
import type { EditorTheme } from '../types/editor.types';

const THEME_STORAGE_KEY = 'webcanvas-editor-theme';

const VALID_THEMES: EditorTheme[] = ['vs-dark', 'vs-light', 'hc-black'];

export function loadPersistedEditorTheme(): EditorTheme | null {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && VALID_THEMES.includes(saved as EditorTheme)) {
      return saved as EditorTheme;
    }
  } catch {
    // ignore quota / private mode
  }
  return null;
}

export function persistEditorTheme(theme: EditorTheme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

/** Applies shell light/dark mode from the editor theme choice. */
export function useAppTheme() {
  const editorTheme = useEditorStore((s) => s.editorTheme);

  useEffect(() => {
    const appTheme = editorTheme === 'vs-light' ? 'light' : 'dark';
    document.documentElement.dataset.appTheme = appTheme;
  }, [editorTheme]);
}

export function hydrateEditorThemeFromStorage(): void {
  const saved = loadPersistedEditorTheme();
  if (!saved) return;

  useEditorStore.getState().setEditorTheme(saved);
  document.documentElement.dataset.appTheme = saved === 'vs-light' ? 'light' : 'dark';
}
