export interface ProjectFileData {
  html: string;
  css: string;
  js: string;
  filePath?: string;
}

export interface PlatformBridge {
  isDesktop: boolean;
  openProject: () => Promise<ProjectFileData | null>;
  saveProject: (html: string, css: string, js: string, filePath?: string) => Promise<string | null>;
  saveProjectAs: (html: string, css: string, js: string) => Promise<string | null>;
}

function assembleFullHtml(html: string, css: string, js: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Webcanvas Project</title>
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

function parseHtmlFile(content: string): { html: string; css: string; js: string } {
  let css = '';
  let js = '';
  let html = '';

  // Extract CSS from <style> tags
  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (styleMatch) css = styleMatch[1].trim();

  // Extract JS from <script> tags (not src-based)
  const scriptMatch = content.match(/<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/i);
  if (scriptMatch) js = scriptMatch[1].trim();

  // Extract body content
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    html = bodyMatch[1]
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .trim();
  }

  return { html, css, js };
}

// Web implementation — no native file access
const webBridge: PlatformBridge = {
  isDesktop: false,
  openProject: async () => null,
  saveProject: async () => null,
  saveProjectAs: async () => null,
};

async function createTauriBridge(): Promise<PlatformBridge> {
  const { open, save } = await import('@tauri-apps/plugin-dialog');
  const { readTextFile, writeTextFile } = await import('@tauri-apps/plugin-fs');

  return {
    isDesktop: true,

    openProject: async () => {
      const path = await open({
        multiple: false,
        filters: [{ name: 'HTML Files', extensions: ['html', 'htm'] }],
      });

      if (!path) return null;

      const content = await readTextFile(path as string);
      const parsed = parseHtmlFile(content);
      return { ...parsed, filePath: path as string };
    },

    saveProject: async (html, css, js, filePath?) => {
      if (!filePath) {
        return webBridge.saveProjectAs!(html, css, js);
      }
      const content = assembleFullHtml(html, css, js);
      await writeTextFile(filePath, content);
      return filePath;
    },

    saveProjectAs: async (html, css, js) => {
      const path = await save({
        filters: [{ name: 'HTML Files', extensions: ['html'] }],
        defaultPath: 'project.html',
      });

      if (!path) return null;

      const content = assembleFullHtml(html, css, js);
      await writeTextFile(path, content);
      return path;
    },
  };
}

let _bridge: PlatformBridge | null = null;

export async function getPlatformBridge(): Promise<PlatformBridge> {
  if (_bridge) return _bridge;

  // Check for Tauri runtime
  if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    try {
      _bridge = await createTauriBridge();
      return _bridge;
    } catch {
      // Tauri APIs not available, fall back to web
    }
  }

  _bridge = webBridge;
  return _bridge;
}

export function isDesktop(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}
