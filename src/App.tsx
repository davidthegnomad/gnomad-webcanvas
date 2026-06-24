import { useCallback, useEffect, useRef, useState } from 'react';
import TopNavbar from './components/TopNavbar';
import Workspace from './components/Workspace';
import AboutModal from './components/AboutModal';
import ColorPicker from './components/FloatingTools/ColorPicker';
import CssGenerator from './components/FloatingTools/CssGenerator';
import FontPairings from './components/FloatingTools/FontPairings';
import ToolSection from './components/ToolSection';
import { TOOL_HINTS } from './constants/uiHints';
import UnsavedChangesModal from './components/UnsavedChangesModal';
import { useEditorStore } from './store/editorStore';
import { exportProject } from './utils/exportProject';
import { saveProjectData } from './utils/projectManager';
import { getPlatformBridge, isDesktop } from './utils/platformBridge';
import { addRecentFile } from './utils/recentFiles';
import { useAppTheme } from './hooks/useAppTheme';
import { useProjectHydration } from './hooks/useProjectHydration';
import { useDebouncedProjectSave } from './hooks/useDebouncedProjectSave';
import { useDesktopWindowTitle } from './hooks/useDesktopWindowTitle';
import { useEditorKeyboardShortcuts } from './hooks/useEditorKeyboardShortcuts';
import { useTauriDesktopEvents } from './hooks/useTauriDesktopEvents';
import { finishWindowClose } from './lib/windowClose';
import { editorThemeToUiTheme } from './utils/preferences';
import { basename } from './utils/pathUtils';

function fileDisplayName(filePath: string | null): string {
  if (!filePath) return 'Untitled';
  return basename(filePath);
}

export default function App() {
  useAppTheme();
  useProjectHydration();
  useDesktopWindowTitle();

  const previewFullscreen = useEditorStore((s) => s.previewFullscreen);
  const initializeStore = useEditorStore((s) => s.initializeStore);
  const setCurrentFilePath = useEditorStore((s) => s.setCurrentFilePath);
  const setDirty = useEditorStore((s) => s.setDirty);
  const bumpProjectVersion = useEditorStore((s) => s.bumpProjectVersion);
  const editorTheme = useEditorStore((s) => s.editorTheme);
  const currentFilePath = useEditorStore((s) => s.currentFilePath);

  const [aboutOpen, setAboutOpen] = useState(false);
  const [aboutAutoCheck, setAboutAutoCheck] = useState(false);
  const [closePromptOpen, setClosePromptOpen] = useState(false);
  const [storageToast, setStorageToast] = useState<string | null>(null);
  const pendingWindowClose = useRef(false);

  const showStorageError = useCallback((message: string) => {
    setStorageToast(message);
    setTimeout(() => setStorageToast(null), 4000);
  }, []);

  useDebouncedProjectSave(showStorageError);
  useEditorKeyboardShortcuts(closePromptOpen);

  const destroyWindow = useCallback(async () => {
    await finishWindowClose();
  }, []);

  const handleDesktopOpen = useCallback(async (presetPath?: string) => {
    const bridge = await getPlatformBridge();
    if (!bridge.isDesktop) return;
    const result = await bridge.openProject(presetPath);
    if (result) {
      initializeStore({
        htmlCode: result.html,
        cssCode: result.css,
        jsCode: result.js,
        activeLibraries: [],
      });
      const path = result.filePath ?? null;
      setCurrentFilePath(path);
      if (path) addRecentFile(path);
      setDirty(false);
      bumpProjectVersion();
    }
  }, [initializeStore, setCurrentFilePath, setDirty, bumpProjectVersion]);

  const handleDesktopSave = useCallback(async () => {
    const bridge = await getPlatformBridge();
    const s = useEditorStore.getState();
    if (bridge.isDesktop) {
      const path = await bridge.saveProject(s.htmlCode, s.cssCode, s.jsCode, s.currentFilePath ?? undefined);
      if (path) {
        setCurrentFilePath(path);
        addRecentFile(path);
        setDirty(false);
        return true;
      }
      return false;
    }

    saveProjectData(s.currentProjectId, {
      htmlCode: s.htmlCode,
      cssCode: s.cssCode,
      jsCode: s.jsCode,
      activeLibraries: s.activeLibraries,
      fontPairingId: s.fontPairingId,
      customHeadingFont: s.customHeadingFont,
      customBodyFont: s.customBodyFont,
    });
    setDirty(false);
    return true;
  }, [setCurrentFilePath, setDirty]);

  const handleDesktopSaveAs = useCallback(async () => {
    const bridge = await getPlatformBridge();
    const s = useEditorStore.getState();
    if (bridge.isDesktop) {
      const path = await bridge.saveProjectAs(s.htmlCode, s.cssCode, s.jsCode);
      if (path) {
        setCurrentFilePath(path);
        addRecentFile(path);
        setDirty(false);
        return true;
      }
      return false;
    }

    await exportProject(s.htmlCode, s.cssCode, s.jsCode, s.activeLibraries);
    return true;
  }, [setCurrentFilePath, setDirty]);

  const handleExport = useCallback(async () => {
    const s = useEditorStore.getState();
    await exportProject(s.htmlCode, s.cssCode, s.jsCode, s.activeLibraries);
  }, []);

  const requestWindowClose = useCallback(async () => {
    if (!isDesktop()) return;
    if (!useEditorStore.getState().isDirty) {
      await destroyWindow();
      return;
    }
    pendingWindowClose.current = true;
    setClosePromptOpen(true);
  }, [destroyWindow]);

  const dismissClosePrompt = useCallback(() => {
    pendingWindowClose.current = false;
    setClosePromptOpen(false);
  }, []);

  const handleClosePromptSave = useCallback(async () => {
    const saved = await handleDesktopSave();
    if (!saved) return;
    if (pendingWindowClose.current) {
      pendingWindowClose.current = false;
      setClosePromptOpen(false);
      await destroyWindow();
    } else {
      dismissClosePrompt();
    }
  }, [handleDesktopSave, destroyWindow, dismissClosePrompt]);

  const handleClosePromptDiscard = useCallback(async () => {
    pendingWindowClose.current = false;
    setClosePromptOpen(false);
    await destroyWindow();
  }, [destroyWindow]);

  const desktopHandlers = useRef<import('./hooks/useTauriDesktopEvents').DesktopEventHandlers>({
    onShowAbout: () => undefined,
    onCheckUpdates: () => undefined,
    onFileOpen: () => undefined,
    onFileSave: () => undefined,
    onFileSaveAs: () => undefined,
    onFileExport: () => undefined,
    onFileClose: () => undefined,
    onOpenPath: () => undefined,
  });

  desktopHandlers.current = {
    onShowAbout: () => {
      setAboutAutoCheck(false);
      setAboutOpen(true);
    },
    onCheckUpdates: () => {
      setAboutAutoCheck(true);
      setAboutOpen(true);
    },
    onFileOpen: () => void handleDesktopOpen(),
    onFileSave: () => void handleDesktopSave(),
    onFileSaveAs: () => void handleDesktopSaveAs(),
    onFileExport: () => void handleExport(),
    onFileClose: () => void requestWindowClose(),
    onOpenPath: (path: string) => void handleDesktopOpen(path),
  };

  useTauriDesktopEvents(desktopHandlers);

  useEffect(() => {
    document.documentElement.setAttribute('data-ui-theme', editorThemeToUiTheme(editorTheme));
  }, [editorTheme]);

  return (
    <div className="flex flex-col h-screen ui-bg-base ui-text">
      <TopNavbar />
      <Workspace />
      {!previewFullscreen && (
        <div className="flex items-center gap-4 px-4 py-1.5 ui-bg-panel border-t border ui-border shrink-0 overflow-x-auto">
          <ToolSection label="Color Picker" hint={TOOL_HINTS.colors}>
            <ColorPicker />
          </ToolSection>
          <div className="w-px h-4 shrink-0" style={{ backgroundColor: 'var(--ui-border)' }} />
          <ToolSection label="CSS Generator" hint={TOOL_HINTS.cssGen}>
            <CssGenerator />
          </ToolSection>
          <div className="w-px h-4 shrink-0" style={{ backgroundColor: 'var(--ui-border)' }} />
          <ToolSection label="Font Pairings" hint={TOOL_HINTS.fonts}>
            <FontPairings />
          </ToolSection>
        </div>
      )}
      {aboutOpen && (
        <AboutModal
          autoCheckUpdates={aboutAutoCheck}
          onClose={() => {
            setAboutOpen(false);
            setAboutAutoCheck(false);
          }}
        />
      )}
      {closePromptOpen && (
        <UnsavedChangesModal
          fileName={fileDisplayName(currentFilePath)}
          onSave={() => {
            void handleClosePromptSave();
          }}
          onDiscard={() => {
            void handleClosePromptDiscard();
          }}
          onCancel={dismissClosePrompt}
        />
      )}
      {storageToast && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-lg text-sm shadow-lg ui-bg-panel border ui-border"
          role="status"
        >
          {storageToast}
        </div>
      )}
    </div>
  );
}
