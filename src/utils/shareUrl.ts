import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

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

export function copyShareUrl(): void {
  navigator.clipboard.writeText(window.location.href).catch(() => {
    // Fallback for older browsers
    const input = document.createElement('input');
    input.value = window.location.href;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
  });
}
