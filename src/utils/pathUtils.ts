/** Basename for display — works on Windows and POSIX paths without Tauri. */
export function basename(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  const segment = normalized.split('/').pop();
  return segment && segment.length > 0 ? segment : filePath;
}

/** Lowercase extension without dot — handles Windows backslashes. */
export function fileExtension(filePath: string): string {
  const base = basename(filePath);
  const dot = base.lastIndexOf('.');
  if (dot <= 0 || dot === base.length - 1) return '';
  return base.slice(dot + 1).toLowerCase();
}
