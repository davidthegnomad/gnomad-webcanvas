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

function dialogPath(result: unknown): string | null {
  if (typeof result !== 'string' || result.length === 0) return null;
  return result;
}

function hasAllowedExtension(filePath: string): boolean {
  const base = filePath.replace(/\\/g, '/').split('/').pop() ?? filePath;
  const ext = base.includes('.') ? base.split('.').pop()?.toLowerCase() ?? '' : '';
  return OPEN_FILE_EXTENSIONS.includes(ext);
}

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
  const { invoke } = await import('@tauri-apps/api/core');

  const writeProject = async (html: string, css: string, js: string, path: string) => {
    const content = assembleFullHtml(html, css, js);
    await invoke('write_text_file_path', { path, content });
    return path;
  };

  const saveProjectAs = async (html: string, css: string, js: string) => {
    const path = dialogPath(
      await save({
        filters: [HTML_SAVE_FILTER],
        defaultPath: 'project.html',
      }),
    );

    if (!path) return null;
    return writeProject(html, css, js, path);
  };

  const openProject = async (presetPath?: string) => {
    const path =
      presetPath ??
      dialogPath(
        await open({
          multiple: false,
          filters: [WEB_FILE_FILTER],
        }),
      );

    if (!path) return null;
    if (!hasAllowedExtension(path)) return null;

    const content = await invoke<string>('read_text_file_path', { path });
    const parsed = parseFileContent(content, path);
    return { ...parsed, filePath: path };
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
      const path = dialogPath(
        await save({
          filters: [ZIP_SAVE_FILTER],
          defaultPath: defaultName.endsWith('.zip') ? defaultName : `${defaultName}.zip`,
        }),
      );
      if (!path) return false;
      const bytes = new Uint8Array(await blob.arrayBuffer());
      await invoke('write_binary_file_path', { path, content: Array.from(bytes) });
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
