import packageJson from '../../package.json';

export const APP_NAME = 'Gnomad Studio Webcanvas';
export const APP_VERSION = packageJson.version;
export const APP_CHANNEL = 'Beta';
export const APP_VERSION_LABEL = `${APP_VERSION} · ${APP_CHANNEL}`;
export const BUG_REPORT_EMAIL = 'david@gnomad.studio';
export const STUDIO_NAME = 'Gnomad Studio';
export const STUDIO_URL = 'https://gnomadstudio.org';

export async function openExternalUrl(url: string): Promise<void> {
  if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    const { openUrl } = await import('@tauri-apps/plugin-opener');
    await openUrl(url);
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function buildBugReportMailto(): string {
  const subject = encodeURIComponent(`${APP_NAME} Bug Report (v${APP_VERSION})`);
  const body = encodeURIComponent(
    [
      'Describe the bug:',
      '',
      '',
      'Steps to reproduce:',
      '1.',
      '2.',
      '3.',
      '',
      'Expected behavior:',
      '',
      '',
      'Actual behavior:',
      '',
      '',
      '---',
      `App: ${APP_NAME} v${APP_VERSION}`,
      `URL: ${typeof window !== 'undefined' ? window.location.href : ''}`,
      `Platform: ${typeof navigator !== 'undefined' ? navigator.userAgent : ''}`,
    ].join('\n'),
  );

  return `mailto:${BUG_REPORT_EMAIL}?subject=${subject}&body=${body}`;
}
