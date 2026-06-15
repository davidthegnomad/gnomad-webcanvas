/** Basename for display — works on Windows and POSIX paths without Tauri. */
export function basename(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  const segment = normalized.split('/').pop();
  return segment && segment.length > 0 ? segment : filePath;
}
