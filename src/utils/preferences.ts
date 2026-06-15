import type { EditorTheme } from '../types/editor.types';

const PREFS_KEY = 'liveview-preferences';

export interface UserPreferences {
  editorTheme: EditorTheme;
  uiFollowSystem: boolean;
}

const DEFAULT_PREFS: UserPreferences = {
  editorTheme: 'vs-dark',
  uiFollowSystem: false,
};

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    const theme = parsed.editorTheme;
    if (theme === 'vs-dark' || theme === 'vs-light' || theme === 'hc-black') {
      return {
        editorTheme: theme,
        uiFollowSystem: parsed.uiFollowSystem === true,
      };
    }
    return DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePreferences(prefs: Partial<UserPreferences>): void {
  try {
    const current = loadPreferences();
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
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
