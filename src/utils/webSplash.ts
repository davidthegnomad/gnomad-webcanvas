const SPLASH_ID = 'gnomad-splash';
const MIN_TOTAL_MS = 1500;
const FADE_MS = 450;

declare global {
  interface Window {
    __GNOMAD_SPLASH_START__?: number;
  }
}

function removeSplashImmediate(): void {
  document.getElementById(SPLASH_ID)?.remove();
}

/** Fade out the web splash after the app mounts. Skipped on Tauri desktop. */
export function dismissWebSplash(): void {
  if (typeof window === 'undefined') return;

  if ('__TAURI_INTERNALS__' in window) {
    removeSplashImmediate();
    return;
  }

  const splash = document.getElementById(SPLASH_ID);
  if (!splash) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const minTotal = reducedMotion ? 400 : MIN_TOTAL_MS;
  const fadeMs = reducedMotion ? 150 : FADE_MS;

  const start = window.__GNOMAD_SPLASH_START__ ?? Date.now();
  const delay = Math.max(0, minTotal - (Date.now() - start));

  window.setTimeout(() => {
    splash.classList.add('gnomad-splash-exit');
    window.setTimeout(() => splash.remove(), fadeMs);
  }, delay);
}
