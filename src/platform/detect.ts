import type { AppPlatform, DesktopPlatform } from './types';

/** Detect OS from Tauri userAgent when available; fallback to navigator. */
export function detectAppPlatform(): AppPlatform {
  if (typeof window === 'undefined') return 'web';
  if (!('__TAURI_INTERNALS__' in window)) return 'web';

  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('mac os') || ua.includes('macintosh')) return 'macos';
  if (ua.includes('linux')) return 'linux';
  if (ua.includes('windows')) return 'windows';
  return 'unknown';
}

export function isLinuxDesktop(): boolean {
  return detectAppPlatform() === 'linux';
}

export function isMacDesktop(): boolean {
  return detectAppPlatform() === 'macos';
}

export function desktopPlatformLabel(platform: DesktopPlatform): string {
  switch (platform) {
    case 'linux':
      return 'Linux';
    case 'macos':
      return 'macOS';
    case 'windows':
      return 'Windows';
    default:
      return 'Desktop';
  }
}
