import type { PlatformRuntime } from './types';

export function getMacRuntime(): PlatformRuntime {
  return {
    kind: 'macos',
    label: 'macOS',
    webkitEnvHints: {},
  };
}
