import { assembleFullHtml, parseHtmlFile } from './parseHtmlFile';

export { parseHtmlFile, assembleFullHtml } from './parseHtmlFile';

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

import { isTauri } from '@tauri-apps/api/core';

export function isDesktop(): boolean {
  try {
    return typeof window !== 'undefined' && isTauri();
  } catch {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  }
}
