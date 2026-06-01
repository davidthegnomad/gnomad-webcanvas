import type { EditorTheme } from '../types/editor.types';

const PREFS_KEY = 'liveview-preferences';

export interface UserPreferences {
  editorTheme: EditorTheme;
}

const DEFAULT_PREFS: UserPreferences = {
  editorTheme: 'vs-dark',
};

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    const theme = parsed.editorTheme;
    if (theme === 'vs-dark' || theme === 'vs-light' || theme === 'hc-black') {
      return { editorTheme: theme };
    }
    return DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // quota exceeded or private mode
  }
}

/** Maps Monaco editor theme to shell UI theme attribute. */
export function editorThemeToUiTheme(theme: EditorTheme): 'dark' | 'light' | 'hc' {
  switch (theme) {
    case 'vs-light':
      return 'light';
    case 'hc-black':
      return 'hc';
    default:
      return 'dark';
  }
}
