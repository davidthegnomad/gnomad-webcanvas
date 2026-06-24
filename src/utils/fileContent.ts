import { parseHtmlFile } from './parseHtmlFile';

import { fileExtension } from './pathUtils';

export const OPEN_FILE_EXTENSIONS = ['html', 'htm', 'txt', 'css', 'js', 'md'];

export function parseFileContent(
  content: string,
  filePath: string,
): { html: string; css: string; js: string } {
  const ext = fileExtension(filePath);

  switch (ext) {
    case 'css':
      return { html: '<p>Edit your stylesheet — preview updates live.</p>', css: content, js: '' };
    case 'js':
      return { html: '<p>JavaScript preview runs below.</p>', css: '', js: content };
    case 'txt':
    case 'md':
      return {
        html: `<pre class="text-file">${escapeHtmlTextContent(content)}</pre>`,
        css: `pre.text-file {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}`,
        js: '',
      };
    case 'html':
    case 'htm':
    default:
      return parseHtmlFile(content);
  }
}

/** Escape text for safe insertion inside HTML text nodes (not attribute values). */
function escapeHtmlTextContent(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
