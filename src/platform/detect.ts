import type { AppPlatform, DesktopPlatform } from './types';

let cachedPlatform: AppPlatform | null = null;

async function detectFromTauri(): Promise<AppPlatform | null> {
  if (typeof window === 'undefined' || !('__TAURI_INTERNALS__' in window)) {
    return null;
  }
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const os = await invoke<string>('get_desktop_platform');
    if (os === 'macos') return 'macos';
    if (os === 'linux') return 'linux';
    if (os === 'windows') return 'windows';
    return 'unknown';
  } catch {
    return null;
  }
}

function detectFromUserAgent(): AppPlatform {
  if (typeof window === 'undefined') return 'web';
  if (!('__TAURI_INTERNALS__' in window)) return 'web';

  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('mac os') || ua.includes('macintosh')) return 'macos';
  if (ua.includes('linux')) return 'linux';
  if (ua.includes('windows')) return 'windows';
  return 'unknown';
}

/** Detect OS from Tauri `platform()` when available; fallback to navigator. */
export function detectAppPlatform(): AppPlatform {
  if (cachedPlatform) return cachedPlatform;
  cachedPlatform = detectFromUserAgent();
  void detectFromTauri().then((os) => {
    if (os) cachedPlatform = os;
  });
  return cachedPlatform;
}

export async function detectAppPlatformAsync(): Promise<AppPlatform> {
  const fromTauri = await detectFromTauri();
  if (fromTauri) {
    cachedPlatform = fromTauri;
    return fromTauri;
  }
  cachedPlatform = detectFromUserAgent();
  return cachedPlatform;
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
