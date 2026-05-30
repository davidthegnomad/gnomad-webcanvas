import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { dismissWebSplash } from './utils/webSplash';
import { hydrateEditorThemeFromStorage } from './hooks/useAppTheme';
import './app.css';

hydrateEditorThemeFromStorage();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

dismissWebSplash();
