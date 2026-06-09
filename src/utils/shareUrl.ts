import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { PUBLIC_APP_URL } from '../constants/branding';
import { isDesktop } from './platformBridge';

interface ShareableState {
  html: string;
  css: string;
  js: string;
  libs?: string[];
  fp?: string | null;
  hf?: string | null;
  bf?: string | null;
}

export function encodeProjectToHash(state: {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  activeLibraries: { id: string }[];
  fontPairingId?: string | null;
  customHeadingFont?: string | null;
  customBodyFont?: string | null;
}): string {
  const payload: ShareableState = {
    html: state.htmlCode,
    css: state.cssCode,
    js: state.jsCode,
  };

  if (state.activeLibraries.length > 0) {
    payload.libs = state.activeLibraries.map((l) => l.id);
  }
  if (state.fontPairingId) payload.fp = state.fontPairingId;
  if (state.customHeadingFont) payload.hf = state.customHeadingFont;
  if (state.customBodyFont) payload.bf = state.customBodyFont;

  return compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeProjectFromHash(hash: string): ShareableState | null {
  try {
    const cleaned = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!cleaned) return null;
    const json = decompressFromEncodedURIComponent(cleaned);
    if (!json) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function buildShareUrl(hash: string): string {
  const cleaned = hash.startsWith('#') ? hash : `#${hash}`;
  if (isDesktop()) {
    return `${PUBLIC_APP_URL}${cleaned}`;
  }
  const { origin, pathname } = window.location;
  return `${origin}${pathname}${cleaned}`;
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (isDesktop()) {
    try {
      const { writeText } = await import('@tauri-apps/plugin-clipboard-manager');
      await writeText(text);
      return true;
    } catch {
      // fall through to web APIs
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const input = document.createElement('textarea');
      input.value = text;
      input.style.position = 'fixed';
      input.style.left = '-9999px';
      document.body.appendChild(input);
      input.focus();
      input.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(input);
      return ok;
    } catch {
      return false;
    }
  }
}

export async function copyShareUrl(hash: string): Promise<boolean> {
  return copyTextToClipboard(buildShareUrl(hash));
}
