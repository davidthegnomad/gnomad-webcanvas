import { invoke } from '@tauri-apps/api/core';
import { assembleFullHtml, parseFileContent, OPEN_FILE_EXTENSIONS } from './fileContent';

export interface ProjectFileData {
  html: string;
  css: string;
  js: string;
  filePath?: string;
}

export interface PlatformBridge {
  isDesktop: boolean;
  openProject: () => Promise<ProjectFileData | null>;
  openFileAtPath?: (filePath: string) => Promise<ProjectFileData | null>;
  getPendingOpenPaths?: () => Promise<string[]>;
  saveProject: (html: string, css: string, js: string, filePath?: string) => Promise<string | null>;
  saveProjectAs: (html: string, css: string, js: string) => Promise<string | null>;
}

const OPEN_FILTERS = [
  { name: 'Web & Text Files', extensions: OPEN_FILE_EXTENSIONS },
  { name: 'HTML', extensions: ['html', 'htm'] },
  { name: 'Text', extensions: ['txt', 'md'] },
  { name: 'CSS', extensions: ['css'] },
  { name: 'JavaScript', extensions: ['js'] },
];

async function readPathContent(filePath: string): Promise<string> {
  return invoke<string>('read_text_file_path', { path: filePath });
}

function toProjectData(content: string, filePath: string): ProjectFileData {
  const parsed = parseFileContent(content, filePath);
  return { ...parsed, filePath };
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
  const { writeTextFile } = await import('@tauri-apps/plugin-fs');

  return {
    isDesktop: true,

    openProject: async () => {
      const path = await open({
        multiple: false,
        filters: OPEN_FILTERS,
      });

      if (!path) return null;

      const content = await readPathContent(path as string);
      return toProjectData(content, path as string);
    },

    openFileAtPath: async (filePath) => {
      const content = await readPathContent(filePath);
      return toProjectData(content, filePath);
    },

    getPendingOpenPaths: async () => invoke<string[]>('take_pending_open_files'),

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
        filters: [{ name: 'HTML Files', extensions: ['html', 'htm'] }],
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
