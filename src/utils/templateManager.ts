import type { Template } from '../constants/templates';
import type { CDNLibrary } from '../types/editor.types';

const STORAGE_KEY = 'webcanvas_user_templates';
const MAX_USER_TEMPLATES = 25;

export interface UserTemplateInput {
  name: string;
  description?: string;
  html: string;
  css: string;
  js: string;
  libraries: CDNLibrary[];
}

function generateId(): string {
  return `user-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function loadUserTemplates(): Template[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Template[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistUserTemplates(templates: Template[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function saveUserTemplate(input: UserTemplateInput): Template {
  const templates = loadUserTemplates();
  if (templates.length >= MAX_USER_TEMPLATES) {
    throw new Error(`Maximum of ${MAX_USER_TEMPLATES} saved templates reached`);
  }

  const template: Template = {
    id: generateId(),
    name: input.name.trim(),
    description: input.description?.trim() || 'Custom template',
    html: input.html,
    css: input.css,
    js: input.js,
    libraries: input.libraries,
  };

  persistUserTemplates([template, ...templates]);
  return template;
}

export function deleteUserTemplate(id: string): Template[] {
  const templates = loadUserTemplates().filter((t) => t.id !== id);
  persistUserTemplates(templates);
  return templates;
}

export function isUserTemplate(id: string): boolean {
  return id.startsWith('user-');
}
