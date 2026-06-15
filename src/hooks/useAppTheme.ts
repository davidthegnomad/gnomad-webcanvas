import { useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';
import type { EditorTheme } from '../types/editor.types';
import { editorThemeToUiTheme } from '../utils/preferences';

const THEME_STORAGE_KEY = 'webcanvas-editor-theme';

const VALID_THEMES: EditorTheme[] = ['vs-dark', 'vs-light', 'hc-black'];

function systemUiTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

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

/** Applies shell light/dark mode from editor theme or system preference. */
export function useAppTheme() {
  const editorTheme = useEditorStore((s) => s.editorTheme);
  const uiFollowSystem = useEditorStore((s) => s.uiFollowSystem);

  useEffect(() => {
    const apply = () => {
      if (uiFollowSystem) {
        document.documentElement.dataset.appTheme = systemUiTheme();
        document.documentElement.setAttribute('data-ui-theme', systemUiTheme());
        return;
      }
      const appTheme = editorTheme === 'vs-light' ? 'light' : 'dark';
      document.documentElement.dataset.appTheme = appTheme;
      document.documentElement.setAttribute('data-ui-theme', editorThemeToUiTheme(editorTheme));
    };

    apply();

    if (!uiFollowSystem) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => apply();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [editorTheme, uiFollowSystem]);
}

export function hydrateEditorThemeFromStorage(): void {
  const saved = loadPersistedEditorTheme();
  if (!saved) return;

  useEditorStore.getState().setEditorTheme(saved);
  document.documentElement.dataset.appTheme = saved === 'vs-light' ? 'light' : 'dark';
}
