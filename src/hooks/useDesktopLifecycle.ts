import { useCallback, useEffect, useRef, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import { useEditorStore } from '../store/editorStore';
import { getPlatformBridge, isDesktop, type ProjectFileData } from '../utils/platformBridge';

interface DesktopLifecycleOptions {
  onLoadFile: (data: ProjectFileData) => void;
  onSave: () => Promise<boolean>;
}

export function useDesktopLifecycle({ onLoadFile, onSave }: DesktopLifecycleOptions) {
  const [closePromptOpen, setClosePromptOpen] = useState(false);
  const closingRef = useRef(false);

  const loadPath = useCallback(
    async (filePath: string) => {
      const bridge = await getPlatformBridge();
      if (!bridge.isDesktop || !bridge.openFileAtPath) return;
      const data = await bridge.openFileAtPath(filePath);
      if (data) onLoadFile(data);
    },
    [onLoadFile],
  );

  useEffect(() => {
    if (!isDesktop()) return;

    let unlistenClose: (() => void) | undefined;
    let unlistenFile: (() => void) | undefined;
    let unlistenPending: (() => void) | undefined;

    void (async () => {
      const win = getCurrentWindow();

      unlistenClose = await win.onCloseRequested((event) => {
        const { isDirty } = useEditorStore.getState();
        if (closingRef.current || !isDirty) return;
        event.preventDefault();
        setClosePromptOpen(true);
      });

      unlistenFile = await listen<string>('webcanvas:open-file', (e) => {
        if (e.payload) void loadPath(e.payload);
      });

      unlistenPending = await listen<string[]>('webcanvas:pending-files', (e) => {
        const first = e.payload?.[0];
        if (first) void loadPath(first);
      });

      const bridge = await getPlatformBridge();
      if (bridge.getPendingOpenPaths) {
        const pending = await bridge.getPendingOpenPaths();
        if (pending[0]) void loadPath(pending[0]);
      }
    })();

    return () => {
      unlistenClose?.();
      unlistenFile?.();
      unlistenPending?.();
    };
  }, [loadPath]);

  const closePromptFileName = useEditorStore((s) => {
    if (s.currentFilePath) {
      return s.currentFilePath.split(/[/\\]/).pop() ?? 'This project';
    }
    const project = s.projects.find((p) => p.id === s.currentProjectId);
    return project?.name ?? 'This project';
  });

  const finishClose = useCallback(async () => {
    closingRef.current = true;
    setClosePromptOpen(false);
    await getCurrentWindow().destroy();
  }, []);

  const handleCloseSave = useCallback(async () => {
    const saved = await onSave();
    if (saved) await finishClose();
  }, [onSave, finishClose]);

  const handleCloseDiscard = useCallback(async () => {
    await finishClose();
  }, [finishClose]);

  const handleCloseCancel = useCallback(() => {
    setClosePromptOpen(false);
  }, []);

  return {
    closePromptOpen,
    closePromptFileName,
    handleCloseSave,
    handleCloseDiscard,
    handleCloseCancel,
    loadPath,
  };
}
