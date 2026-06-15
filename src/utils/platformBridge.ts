import { assembleFullHtml } from './parseHtmlFile';
import { OPEN_FILE_EXTENSIONS, parseFileContent } from './fileContent';

export { parseHtmlFile, assembleFullHtml } from './parseHtmlFile';

export interface ProjectFileData {
  html: string;
  css: string;
  js: string;
  filePath?: string;
}

export interface PlatformBridge {
  isDesktop: boolean;
  openProject: (filePath?: string) => Promise<ProjectFileData | null>;
  saveProject: (html: string, css: string, js: string, filePath?: string) => Promise<string | null>;
  saveProjectAs: (html: string, css: string, js: string) => Promise<string | null>;
  exportZip: (blob: Blob, defaultName: string) => Promise<boolean>;
}

const WEB_FILE_FILTER = {
  name: 'Web project files',
  extensions: OPEN_FILE_EXTENSIONS,
};

const HTML_SAVE_FILTER = {
  name: 'HTML files',
  extensions: ['html', 'htm'],
};

const ZIP_SAVE_FILTER = {
  name: 'ZIP archive',
  extensions: ['zip'],
};

// Web implementation — no native file access
const webBridge: PlatformBridge = {
  isDesktop: false,
  openProject: async () => null,
  saveProject: async () => null,
  saveProjectAs: async () => null,
  exportZip: async () => false,
};

async function createTauriBridge(): Promise<PlatformBridge> {
  const { open, save } = await import('@tauri-apps/plugin-dialog');
  const { readTextFile, writeTextFile, writeFile } = await import('@tauri-apps/plugin-fs');

  const writeProject = async (html: string, css: string, js: string, path: string) => {
    const content = assembleFullHtml(html, css, js);
    await writeTextFile(path, content);
    return path;
  };

  const saveProjectAs = async (html: string, css: string, js: string) => {
    const path = await save({
      filters: [HTML_SAVE_FILTER],
      defaultPath: 'project.html',
    });

    if (!path) return null;
    return writeProject(html, css, js, path as string);
  };

  const openProject = async (presetPath?: string) => {
    const path =
      presetPath ??
      (await open({
        multiple: false,
        filters: [WEB_FILE_FILTER],
      }));

    if (!path) return null;

    const filePath = path as string;
    const content = await readTextFile(filePath);
    const parsed = parseFileContent(content, filePath);
    return { ...parsed, filePath };
  };

  return {
    isDesktop: true,
    openProject,
    saveProject: async (html, css, js, filePath?) => {
      if (!filePath) {
        return saveProjectAs(html, css, js);
      }
      return writeProject(html, css, js, filePath);
    },
    saveProjectAs,
    exportZip: async (blob, defaultName) => {
      const path = await save({
        filters: [ZIP_SAVE_FILTER],
        defaultPath: defaultName.endsWith('.zip') ? defaultName : `${defaultName}.zip`,
      });
      if (!path) return false;
      const bytes = new Uint8Array(await blob.arrayBuffer());
      await writeFile(path as string, bytes);
      return true;
    },
  };
}

let _bridge: PlatformBridge | null = null;
let _tauriDetected: boolean | null = null;

async function detectTauriRuntime(): Promise<boolean> {
  if (_tauriDetected !== null) return _tauriDetected;
  if (typeof window === 'undefined' || !('__TAURI_INTERNALS__' in window)) {
    _tauriDetected = false;
    return false;
  }
  try {
    const { isTauri } = await import('@tauri-apps/api/core');
    _tauriDetected = isTauri();
  } catch {
    _tauriDetected = true;
  }
  if (import.meta.env.DEV && !_tauriDetected) {
    console.warn('[platformBridge] Tauri internals present but runtime detection failed');
  }
  return _tauriDetected;
}

export async function getPlatformBridge(): Promise<PlatformBridge> {
  if (_bridge) return _bridge;

  if (await detectTauriRuntime()) {
    try {
      _bridge = await createTauriBridge();
      return _bridge;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[platformBridge] Failed to initialize Tauri bridge', err);
      }
    }
  }

  _bridge = webBridge;
  return _bridge;
}

/** Sync check for React render paths — use getPlatformBridge() before file I/O. */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  if (_tauriDetected === true) return true;
  return '__TAURI_INTERNALS__' in window;
}

/** True when a file on disk is the active document (desktop file-first mode). */
export function isFileBackedSession(filePath: string | null): boolean {
  return isDesktop() && Boolean(filePath);
}
