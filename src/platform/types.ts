export type DesktopPlatform = 'linux' | 'macos' | 'windows' | 'unknown';
export type AppPlatform = 'web' | DesktopPlatform;

export interface PlatformRuntime {
  kind: AppPlatform;
  /** Linux: prefer X11 WebKit backend when Wayland GPU issues occur */
  webkitEnvHints: Record<string, string>;
  /** Human label for About / bug reports */
  label: string;
}
