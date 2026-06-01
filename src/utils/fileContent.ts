import { PRODUCT_NAME } from '../constants/branding';

export const OPEN_FILE_EXTENSIONS = ['html', 'htm', 'txt', 'css', 'js', 'md'];

export function parseHtmlFile(content: string): { html: string; css: string; js: string } {
  let css = '';
  let js = '';
  let html = '';

  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (styleMatch) css = styleMatch[1].trim();

  const scriptMatch = content.match(/<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/i);
  if (scriptMatch) js = scriptMatch[1].trim();

  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    html = bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, '').trim();
  } else if (/<html[\s>]/i.test(content)) {
    html = content.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, '').trim();
  } else {
    html = content.trim();
  }

  return { html, css, js };
}

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
