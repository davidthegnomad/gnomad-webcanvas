import type { ProjectMeta } from '../types/editor.types';

const INDEX_KEY = 'webcanvas_projects_index';
const PROJECT_PREFIX = 'webcanvas_project_';
const LEGACY_KEY = 'webcanvas_project_cache';
const MAX_PROJECTS = 10;

export interface ProjectData {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  activeLibraries: unknown[];
  fontPairingId?: string | null;
  customHeadingFont?: string | null;
  customBodyFont?: string | null;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function loadProjectsIndex(): ProjectMeta[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveProjectsIndex(projects: ProjectMeta[]): void {
  localStorage.setItem(INDEX_KEY, JSON.stringify(projects));
}

export function loadProjectData(id: string): ProjectData | null {
  try {
    const raw = localStorage.getItem(PROJECT_PREFIX + id);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveProjectData(id: string, data: ProjectData): void {
  localStorage.setItem(PROJECT_PREFIX + id, JSON.stringify(data));
}

export function createProject(name: string): { meta: ProjectMeta; projects: ProjectMeta[] } {
  const projects = loadProjectsIndex();
  if (projects.length >= MAX_PROJECTS) {
    throw new Error(`Maximum of ${MAX_PROJECTS} projects reached`);
  }

  const meta: ProjectMeta = { id: generateId(), name, updatedAt: Date.now() };
  const updated = [...projects, meta];
  saveProjectsIndex(updated);
  saveProjectData(meta.id, {
    htmlCode: '',
    cssCode: '',
    jsCode: '',
    activeLibraries: [],
  });
  return { meta, projects: updated };
}

export function deleteProject(id: string): ProjectMeta[] {
  const projects = loadProjectsIndex().filter((p) => p.id !== id);
  saveProjectsIndex(projects);
  localStorage.removeItem(PROJECT_PREFIX + id);
  return projects;
}

export function renameProject(id: string, name: string): ProjectMeta[] {
  const projects = loadProjectsIndex().map((p) =>
    p.id === id ? { ...p, name, updatedAt: Date.now() } : p,
  );
  saveProjectsIndex(projects);
  return projects;
}

export function touchProject(id: string): ProjectMeta[] {
  const projects = loadProjectsIndex().map((p) =>
    p.id === id ? { ...p, updatedAt: Date.now() } : p,
  );
  saveProjectsIndex(projects);
  return projects;
}

export function migrateLegacyStorage(): { projects: ProjectMeta[]; data: ProjectData | null; defaultId: string } | null {
  const index = loadProjectsIndex();
  if (index.length > 0) return null;

  const defaultId = 'default';
  let data: ProjectData | null = null;

  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      data = JSON.parse(legacy);
      localStorage.removeItem(LEGACY_KEY);
    }
  } catch {}

  const meta: ProjectMeta = { id: defaultId, name: 'My Project', updatedAt: Date.now() };
  const projects = [meta];
  saveProjectsIndex(projects);

  if (data) {
    saveProjectData(defaultId, data);
  }

  return { projects, data, defaultId };
}
