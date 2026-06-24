import { useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';
import { isFileBackedSession } from '../utils/platformBridge';
import { saveProjectData } from '../utils/projectManager';

const SAVE_DEBOUNCE_MS = 1000;

export function useDebouncedProjectSave(onStorageError: (message: string) => void): void {
  const htmlCode = useEditorStore((s) => s.htmlCode);
  const cssCode = useEditorStore((s) => s.cssCode);
  const jsCode = useEditorStore((s) => s.jsCode);

  useEffect(() => {
    const timer = setTimeout(() => {
      const s = useEditorStore.getState();
      if (isFileBackedSession(s.currentFilePath)) return;

      try {
        saveProjectData(s.currentProjectId, {
          htmlCode: s.htmlCode,
          cssCode: s.cssCode,
          jsCode: s.jsCode,
          activeLibraries: s.activeLibraries,
          fontPairingId: s.fontPairingId,
          customHeadingFont: s.customHeadingFont,
          customBodyFont: s.customBodyFont,
        });
      } catch {
        onStorageError('Storage full — could not save project. Free browser space or export your work.');
      }
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [htmlCode, cssCode, jsCode, onStorageError]);
}
