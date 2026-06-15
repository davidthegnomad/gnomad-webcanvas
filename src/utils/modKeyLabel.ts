/** True when the primary modifier should be ⌘ (macOS / iOS). */
export function isMacOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const platform = navigator.platform ?? '';
  const ua = navigator.userAgent ?? '';
  return /Mac|iPhone|iPod|iPad/i.test(platform) || /Mac OS X/i.test(ua);
}

/** Primary modifier label for shortcuts UI. */
export function modKeyLabel(): string {
  return isMacOS() ? '⌘' : 'Ctrl';
}

/** Replace literal "Ctrl" tokens in a shortcut string with the platform modifier. */
export function formatShortcut(shortcut: string): string {
  if (isMacOS()) {
    return shortcut.replace(/\bCtrl\b/g, '⌘');
  }
  return shortcut;
}

/** Build a shortcut like "Ctrl + S" with the correct modifier. */
export function modShortcut(key: string, extras?: { shift?: boolean }): string {
  const mod = modKeyLabel();
  const parts = [mod];
  if (extras?.shift) parts.push('Shift');
  parts.push(key);
  return parts.join(' + ');
}
