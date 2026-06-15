import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './app.css';
import { editorThemeToUiTheme, loadPreferences } from './utils/preferences';

const prefs = loadPreferences();
if (prefs.uiFollowSystem && typeof window !== 'undefined') {
  const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-ui-theme', system);
} else {
  document.documentElement.setAttribute('data-ui-theme', editorThemeToUiTheme(prefs.editorTheme));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
