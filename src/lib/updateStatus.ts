import type { UpdateCheckResult } from './updater';

/** User-facing status line after a desktop update check. */
export function formatUpdateCheckMessage(result: UpdateCheckResult): string {
  if (result.available && result.version) {
    return `Update available: v${result.version}`;
  }

  let message = `You're on the latest version (${result.currentVersion}).`;
  if (result.warning) {
    message += ` ${result.warning}`;
  }
  return message;
}
