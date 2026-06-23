import { useEffect, useCallback, useRef, useState } from 'react';
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
import { decodeProjectFromHash } from './utils/shareUrl';
import { migrateLegacyStorage, loadProjectsIndex, loadProjectData, saveProjectData } from './utils/projectManager';
import { getPlatformBridge, isDesktop, isFileBackedSession } from './utils/platformBridge';
import { CDN_REGISTRY } from './utils/cdnRegistry';
import { PRODUCT_NAME } from './constants/branding';
import { basename } from './utils/pathUtils';
import { addRecentFile } from './utils/recentFiles';
import { useAppTheme } from './hooks/useAppTheme';
import { finishWindowClose } from './lib/windowClose';
import { editorThemeToUiTheme } from './utils/preferences';
import type { PaneType } from './types/editor.types';

const SAVE_DEBOUNCE_MS = 1000;

function fileDisplayName(filePath: string | null): string {
  if (!filePath) return 'Untitled';
  return basename(filePath);
}

export default function App() {
  useAppTheme();
  const htmlCode = useEditorStore((s) => s.htmlCode);
  const cssCode = useEditorStore((s) => s.cssCode);
  const jsCode = useEditorStore((s) => s.jsCode);
  const activeLibraries = useEditorStore((s) => s.activeLibraries);
  const previewFullscreen = useEditorStore((s) => s.previewFullscreen);
  const fontPairingId = useEditorStore((s) => s.fontPairingId);
  const customHeadingFont = useEditorStore((s) => s.customHeadingFont);
  const customBodyFont = useEditorStore((s) => s.customBodyFont);
  const initializeStore = useEditorStore((s) => s.initializeStore);
  const toggleLayout = useEditorStore((s) => s.toggleLayout);
  const setActivePane = useEditorStore((s) => s.setActivePane);
  const forceRefreshPreview = useEditorStore((s) => s.forceRefreshPreview);
  const togglePreviewFullscreen = useEditorStore((s) => s.togglePreviewFullscreen);
  const increaseFontSize = useEditorStore((s) => s.increaseFontSize);
  const decreaseFontSize = useEditorStore((s) => s.decreaseFontSize);
  const toggleConsole = useEditorStore((s) => s.toggleConsole);
  const setCurrentProject = useEditorStore((s) => s.setCurrentProject);
  const updateProjectsMeta = useEditorStore((s) => s.updateProjectsMeta);
  const setCurrentFilePath = useEditorStore((s) => s.setCurrentFilePath);
  const setDirty = useEditorStore((s) => s.setDirty);
  const bumpProjectVersion = useEditorStore((s) => s.bumpProjectVersion);
  const editorTheme = useEditorStore((s) => s.editorTheme);

  const hydrated = useRef(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [aboutAutoCheck, setAboutAutoCheck] = useState(false);
  const [closePromptOpen, setClosePromptOpen] = useState(false);
  const pendingWindowClose = useRef(false);

  // Hydrate: URL hash > project manager > legacy localStorage
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    // Priority 1: URL hash (shared link)
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const decoded = decodeProjectFromHash(hash);
      if (decoded) {
        const libs = decoded.libs
          ? CDN_REGISTRY.filter((l) => decoded.libs!.includes(l.id))
          : [];
        initializeStore({
          htmlCode: decoded.html,
          cssCode: decoded.css,
          jsCode: decoded.js,
          activeLibraries: libs,
          fontPairingId: decoded.fp ?? null,
          customHeadingFont: decoded.hf ?? null,
          customBodyFont: decoded.bf ?? null,
        });
        return;
      }
    }

    // Priority 2: Migrate legacy storage
    const migration = migrateLegacyStorage();
    if (migration) {
      updateProjectsMeta(migration.projects);
      setCurrentProject(migration.defaultId);
      if (migration.data) {
        initializeStore({
          htmlCode: migration.data.htmlCode,
          cssCode: migration.data.cssCode,
          jsCode: migration.data.jsCode,
          activeLibraries: migration.data.activeLibraries as typeof activeLibraries,
        });
      }
      return;
    }

    // Priority 3: Load existing project
    const projectsIndex = loadProjectsIndex();
    if (projectsIndex.length > 0) {
      updateProjectsMeta(projectsIndex);
      const firstId = projectsIndex[0].id;
      setCurrentProject(firstId);
      const data = loadProjectData(firstId);
      if (data) {
        initializeStore({
          htmlCode: data.htmlCode,
          cssCode: data.cssCode,
          jsCode: data.jsCode,
          activeLibraries: data.activeLibraries as typeof activeLibraries,
          fontPairingId: data.fontPairingId ?? null,
          customHeadingFont: data.customHeadingFont ?? null,
          customBodyFont: data.customBodyFont ?? null,
        });
      }
    }
  }, [initializeStore, setCurrentProject, updateProjectsMeta, activeLibraries]);

  // Debounced persistence — save current project to localStorage
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
        // quota exceeded
      }
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [htmlCode, cssCode, jsCode, activeLibraries, fontPairingId, customHeadingFont, customBodyFont]);

  const currentFilePath = useEditorStore((s) => s.currentFilePath);
  const isDirty = useEditorStore((s) => s.isDirty);

  // Window title (desktop)
  useEffect(() => {
    if (!isDesktop()) return;
    const name = fileDisplayName(currentFilePath);
    document.title = `${PRODUCT_NAME} — ${name}${isDirty ? ' *' : ''}`;
  }, [currentFilePath, isDirty]);

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

    exportProject(s.htmlCode, s.cssCode, s.jsCode, s.activeLibraries);
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

  // Global keyboard shortcuts — editor-only; file menu accelerators handled in Rust menu bar
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closePromptOpen) return;

      const mod = e.metaKey || e.ctrlKey;

      if (e.key === 'Escape' && previewFullscreen) {
        e.preventDefault();
        togglePreviewFullscreen();
        return;
      }

      if (!mod) return;

      if (e.shiftKey) {
        if (e.key === 'F' || e.key === 'f') {
          e.preventDefault();
          const pane = useEditorStore.getState().activePane;
          window.dispatchEvent(new CustomEvent('liveview-format', { detail: { pane } }));
          return;
        }
        if (e.key === 'C' || e.key === 'c') {
          e.preventDefault();
          toggleConsole();
          return;
        }
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        forceRefreshPreview();
      } else if (e.key === '\\') {
        e.preventDefault();
        toggleLayout();
      } else if (e.key === '1') {
        e.preventDefault();
        setActivePane('html' as PaneType);
      } else if (e.key === '2') {
        e.preventDefault();
        setActivePane('css' as PaneType);
      } else if (e.key === '3') {
        e.preventDefault();
        setActivePane('js' as PaneType);
      } else if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        increaseFontSize();
      } else if (e.key === '-') {
        e.preventDefault();
        decreaseFontSize();
      }
    },
    [closePromptOpen, forceRefreshPreview, toggleLayout, setActivePane, increaseFontSize, decreaseFontSize, togglePreviewFullscreen, previewFullscreen, toggleConsole],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!isDesktop()) return;

    let cancelled = false;
    const unlisteners: Array<() => void> = [];

    void import('@tauri-apps/api/event').then(async (mod) => {
      if (cancelled) return;
      unlisteners.push(
        await mod.listen('webcanvas:show-about', () => {
          setAboutAutoCheck(false);
          setAboutOpen(true);
        }),
        await mod.listen('webcanvas:check-updates', () => {
          setAboutAutoCheck(true);
          setAboutOpen(true);
        }),
        await mod.listen('webcanvas:file-open', () => void handleDesktopOpen()),
        await mod.listen('webcanvas:file-save', () => void handleDesktopSave()),
        await mod.listen('webcanvas:file-save-as', () => void handleDesktopSaveAs()),
        await mod.listen('webcanvas:file-export', () => void handleExport()),
        await mod.listen('webcanvas:file-close', () => void requestWindowClose()),
        await mod.listen('window-close-requested', () => void requestWindowClose()),
        await mod.listen<string[]>('webcanvas:pending-files', (event) => {
          const paths = event.payload;
          if (paths.length > 0) {
            void handleDesktopOpen(paths[0]);
          }
        }),
      );

      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const pending = await invoke<string[]>('take_pending_open_files');
        if (pending.length > 0) {
          void handleDesktopOpen(pending[0]);
        }
      } catch {
        // not in Tauri shell
      }
    });

    return () => {
      cancelled = true;
      unlisteners.forEach((off) => off());
    };
  }, [handleDesktopOpen, handleDesktopSave, handleDesktopSaveAs, handleExport, requestWindowClose]);

  useEffect(() => {
    document.documentElement.setAttribute('data-ui-theme', editorThemeToUiTheme(editorTheme));
  }, [editorTheme]);

  return (
    <div className="flex flex-col h-screen ui-bg-base ui-text">
      <TopNavbar />
      <Workspace />
      {/* Floating Tools Bar */}
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
    </div>
  );
}
