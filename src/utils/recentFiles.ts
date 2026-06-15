const STORAGE_KEY = 'webcanvas_recent_files';
const MAX_RECENT = 8;

export function getRecentFiles(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p): p is string => typeof p === 'string' && p.length > 0);
  } catch {
    return [];
  }
}

export function addRecentFile(filePath: string): string[] {
  const trimmed = filePath.trim();
  if (!trimmed) return getRecentFiles();

  const next = [trimmed, ...getRecentFiles().filter((p) => p !== trimmed)].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // quota / private mode
  }
  return next;
}

export function clearRecentFiles(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
