import { describe, it, expect } from 'vitest';
import { formatShortcut, isMacOS, modKeyLabel, modShortcut } from '../modKeyLabel';
import { basename } from '../pathUtils';
import { addRecentFile, getRecentFiles, clearRecentFiles } from '../recentFiles';
import { isFileBackedSession } from '../platformBridge';

describe('modKeyLabel', () => {
  it('returns Ctrl or ⌘ based on platform', () => {
    const label = modKeyLabel();
    expect(['Ctrl', '⌘']).toContain(label);
  });

  it('formatShortcut replaces Ctrl on macOS when applicable', () => {
    const formatted = formatShortcut('Ctrl + S');
    if (isMacOS()) {
      expect(formatted).toContain('⌘');
    } else {
      expect(formatted).toBe('Ctrl + S');
    }
  });

  it('modShortcut builds compound shortcuts', () => {
    expect(modShortcut('S')).toMatch(/S$/);
    expect(modShortcut('F', { shift: true })).toContain('Shift');
  });
});

describe('pathUtils', () => {
  it('basename handles posix and windows paths', () => {
    expect(basename('/tmp/project.html')).toBe('project.html');
    expect(basename('C:\\Users\\me\\page.htm')).toBe('page.htm');
  });
});

describe('recentFiles', () => {
  it('tracks recent paths with dedupe', () => {
    clearRecentFiles();
    addRecentFile('/tmp/a.html');
    addRecentFile('/tmp/b.html');
    addRecentFile('/tmp/a.html');
    expect(getRecentFiles()[0]).toBe('/tmp/a.html');
    expect(getRecentFiles()).toHaveLength(2);
    clearRecentFiles();
  });
});

describe('platformBridge helpers', () => {
  it('isFileBackedSession requires desktop + path', () => {
    expect(isFileBackedSession(null)).toBe(false);
    expect(isFileBackedSession('/tmp/x.html')).toBe(typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window);
  });
});
