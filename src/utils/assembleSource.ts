import type { CDNLibrary, ActiveFontPairing } from '../types/editor.types';

function buildFontUrl(pairing: ActiveFontPairing): string {
  const families = [pairing.headingFont, pairing.bodyFont]
    .filter((f, i, a) => a.indexOf(f) === i)
    .map((f) => `family=${f.replace(/ /g, '+')}:wght@400;600;700`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function buildFontStyles(pairing: ActiveFontPairing): string {
  const headingFallback = pairing.headingFont.includes('Serif') || pairing.headingFont.includes('Garamond') || pairing.headingFont.includes('Baskerville') || pairing.headingFont.includes('Playfair') ? 'serif' : 'sans-serif';
  const bodyFallback = pairing.bodyFont.includes('Serif') || pairing.bodyFont.includes('Garamond') || pairing.bodyFont.includes('Baskerville') || pairing.bodyFont.includes('Playfair') ? 'serif' : 'sans-serif';

  return `
    :root {
      --font-heading: '${pairing.headingFont}', ${headingFallback};
      --font-body: '${pairing.bodyFont}', ${bodyFallback};
    }
    h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
    body { font-family: var(--font-body); }`;
}

export function assembleSource(
  html: string,
  css: string,
  js: string,
  activeLibraries: CDNLibrary[],
  fontPairing?: ActiveFontPairing | null,
): string {
  const libraryTags = activeLibraries.map((lib) => lib.tag).join('\n    ');

  const fontLink = fontPairing
    ? `<link href="${buildFontUrl(fontPairing)}" rel="stylesheet">`
    : '';
  const fontStyles = fontPairing ? buildFontStyles(fontPairing) : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${libraryTags}
    ${fontLink}
    <style>
        body { margin: 0; padding: 1rem; }
        ${fontStyles}
        ${css}
    </style>
</head>
<body>
    ${html}
    <script>
        (function() {
            var _orig = { log: console.log, warn: console.warn, error: console.error, info: console.info };
            ['log', 'warn', 'error', 'info'].forEach(function(m) {
                console[m] = function() {
                    _orig[m].apply(console, arguments);
                    try {
                        var a = [];
                        for (var i = 0; i < arguments.length; i++) {
                            var v = arguments[i];
                            a.push(typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v));
                        }
                        parent.postMessage({ type: 'webcanvas-console', method: m, args: a, timestamp: Date.now() }, '*');
                    } catch(e) {}
                };
            });

            window.alert = function(msg) { console.log('[Alert]', msg); };
            window.confirm = function(msg) { console.log('[Confirm]', msg); return false; };
            window.prompt = function(msg) { console.log('[Prompt]', msg); return null; };

            window.onerror = function(msg, url, line) {
                console.error('[Error] ' + msg + ' (line ' + line + ')');
                return true;
            };
        })();

        try { ${js} }
        catch (err) { console.error('[Runtime Error]', err); }
    <\/script>
</body>
</html>`;
}
