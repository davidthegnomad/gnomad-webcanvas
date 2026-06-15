import { parseHtmlFile, assembleFullHtml } from './parseHtmlFile';

export { assembleFullHtml };

export const OPEN_FILE_EXTENSIONS = ['html', 'htm', 'txt', 'css', 'js', 'md'];

export function parseFileContent(
  content: string,
  filePath: string,
): { html: string; css: string; js: string } {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? '';

  switch (ext) {
    case 'css':
      return { html: '<p>Edit your stylesheet — preview updates live.</p>', css: content, js: '' };
    case 'js':
      return { html: '<p>JavaScript preview runs below.</p>', css: '', js: content };
    case 'txt':
    case 'md':
      return {
        html: `<pre class="text-file">${escapeHtml(content)}</pre>`,
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
