import { PRODUCT_NAME } from '../constants/branding';

export interface ParsedHtmlProject {
  html: string;
  css: string;
  js: string;
}

/** Assemble editor panes into a single self-contained HTML document. */
export function assembleFullHtml(html: string, css: string, js: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${PRODUCT_NAME} Project</title>
    <style>
${css}
    </style>
</head>
<body>
${html}
    <script>
${js}
    <\/script>
</body>
</html>`;
}

/**
 * Parse a saved HTML file back into editor panes using the browser DOM parser.
 * Handles multiple style/script tags, attribute ordering, and whitespace variations.
 */
export function parseHtmlFile(content: string): ParsedHtmlProject {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');

  const css = Array.from(doc.querySelectorAll('style'))
    .map((el) => el.textContent ?? '')
    .join('\n\n')
    .trim();

  const js = Array.from(doc.querySelectorAll('script:not([src])'))
    .map((el) => el.textContent ?? '')
    .join('\n\n')
    .trim();

  const body = doc.body;
  if (!body) {
    return { html: '', css, js };
  }

  const clone = body.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('script').forEach((el) => el.remove());
  const html = clone.innerHTML.trim();

  return { html, css, js };
}
