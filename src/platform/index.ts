import { detectAppPlatform, desktopPlatformLabel } from './detect';
import { getLinuxRuntime, logLinuxDevHints } from './linux';
import { getMacRuntime } from './macos';
import type { PlatformRuntime } from './types';

export type { AppPlatform, DesktopPlatform, PlatformRuntime } from './types';
export { detectAppPlatform, isLinuxDesktop, isMacDesktop, desktopPlatformLabel } from './detect';

const WEB_RUNTIME: PlatformRuntime = {
  kind: 'web',
  label: 'Web',
  webkitEnvHints: {},
};

export function getPlatformRuntime(): PlatformRuntime {
  const kind = detectAppPlatform();
  switch (kind) {
    case 'linux':
      return getLinuxRuntime();
    case 'macos':
      return getMacRuntime();
    case 'windows':
    case 'unknown':
      return { kind, label: desktopPlatformLabel(kind === 'unknown' ? 'unknown' : kind), webkitEnvHints: {} };
    default:
      return WEB_RUNTIME;
  }
}

/** Call once at app boot — platform-specific init (no side effects on web). */
export function initPlatform(): void {
  const runtime = getPlatformRuntime();
  if (runtime.kind === 'linux') {
    logLinuxDevHints();
  }
}
