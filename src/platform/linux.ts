import type { PlatformRuntime } from './types';

/** Linux WebKit/Wayland workarounds — applied at startup via env already set in .desktop wrapper. */
export function getLinuxRuntime(): PlatformRuntime {
  return {
    kind: 'linux',
    label: 'Linux',
    webkitEnvHints: {
      GDK_BACKEND: 'x11',
      WEBKIT_DISABLE_DMABUF_RENDERER: '1',
    },
  };
}

/** Log Linux-specific guidance once in dev. */
export function logLinuxDevHints(): void {
  if (!import.meta.env.DEV) return;
  console.info(
    '[platform/linux] Dev tip: npm run tauri:dev:x11 if Wayland WebKit shows a blank window.',
  );
}
