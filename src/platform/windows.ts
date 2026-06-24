import type { PlatformRuntime } from './types';

export function getWindowsRuntime(): PlatformRuntime {
  return {
    kind: 'windows',
    label: 'Windows',
    webkitEnvHints: {},
  };
}
