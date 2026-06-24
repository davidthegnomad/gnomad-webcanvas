import { useEffect, type MutableRefObject } from 'react';
import { isDesktop } from '../utils/platformBridge';

type TauriEventModule = typeof import('@tauri-apps/api/event');

let tauriEventModule: TauriEventModule | null = null;

async function getTauriEventModule(): Promise<TauriEventModule> {
  if (!tauriEventModule) {
    tauriEventModule = await import('@tauri-apps/api/event');
  }
  return tauriEventModule;
}

export interface DesktopEventHandlers {
  onShowAbout: () => void;
  onCheckUpdates: () => void;
  onFileOpen: () => void;
  onFileSave: () => void;
  onFileSaveAs: () => void;
  onFileExport: () => void;
  onFileClose: () => void;
  onOpenPath: (path: string) => void;
}

export function useTauriDesktopEvents(handlersRef: MutableRefObject<DesktopEventHandlers>): void {
  useEffect(() => {
    if (!isDesktop()) return;

    let cancelled = false;
    const unlisteners: Array<() => void> = [];

    void getTauriEventModule().then(async (mod) => {
      if (cancelled) return;
      const h = () => handlersRef.current;
      unlisteners.push(
        await mod.listen('webcanvas:show-about', () => h().onShowAbout()),
        await mod.listen('webcanvas:check-updates', () => h().onCheckUpdates()),
        await mod.listen('webcanvas:file-open', () => h().onFileOpen()),
        await mod.listen('webcanvas:file-save', () => h().onFileSave()),
        await mod.listen('webcanvas:file-save-as', () => h().onFileSaveAs()),
        await mod.listen('webcanvas:file-export', () => h().onFileExport()),
        await mod.listen('webcanvas:file-close', () => h().onFileClose()),
        await mod.listen('window-close-requested', () => h().onFileClose()),
        await mod.listen<string[]>('webcanvas:pending-files', (event) => {
          const paths = event.payload;
          if (paths.length > 0) h().onOpenPath(paths[0]);
        }),
      );

      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const pending = await invoke<string[]>('take_pending_open_files');
        if (pending.length > 0) h().onOpenPath(pending[0]);
      } catch {
        // not in Tauri shell
      }
    });

    return () => {
      cancelled = true;
      unlisteners.forEach((off) => off());
    };
  }, [handlersRef]);
}
