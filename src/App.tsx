import { useEffect, useCallback, useRef } from 'react';
import TopNavbar from './components/TopNavbar';
import Workspace from './components/Workspace';
import ColorPicker from './components/FloatingTools/ColorPicker';
import CssGenerator from './components/FloatingTools/CssGenerator';
import FontPairings from './components/FloatingTools/FontPairings';
import { useEditorStore } from './store/editorStore';
import { exportProject } from './utils/exportProject';
import { decodeProjectFromHash } from './utils/shareUrl';
import { migrateLegacyStorage, loadProjectsIndex, loadProjectData, saveProjectData } from './utils/projectManager';
import { getPlatformBridge, isDesktop } from './utils/platformBridge';
import { CDN_REGISTRY } from './utils/cdnRegistry';
import type { PaneType } from './types/editor.types';

const SAVE_DEBOUNCE_MS = 1000;

export default function App() {
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

  const hydrated = useRef(false);

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
      try {
        const s = useEditorStore.getState();
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
    const name = currentFilePath
      ? currentFilePath.split(/[/\\]/).pop() ?? 'Untitled'
      : 'Untitled';
    document.title = `Webcanvas - ${name}${isDirty ? ' *' : ''}`;
  }, [currentFilePath, isDirty]);

  // Desktop file operations
  const handleDesktopOpen = useCallback(async () => {
    const bridge = await getPlatformBridge();
    if (!bridge.isDesktop) return;
    const result = await bridge.openProject();
    if (result) {
      initializeStore({
        htmlCode: result.html,
        cssCode: result.css,
        jsCode: result.js,
        activeLibraries: [],
      });
      setCurrentFilePath(result.filePath ?? null);
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
        setDirty(false);
      }
    } else {
      // Web: force localStorage save
      saveProjectData(s.currentProjectId, {
        htmlCode: s.htmlCode, cssCode: s.cssCode, jsCode: s.jsCode,
        activeLibraries: s.activeLibraries,
        fontPairingId: s.fontPairingId,
        customHeadingFont: s.customHeadingFont,
        customBodyFont: s.customBodyFont,
      });
      setDirty(false);
    }
  }, [setCurrentFilePath, setDirty]);

  const handleDesktopSaveAs = useCallback(async () => {
    const bridge = await getPlatformBridge();
    const s = useEditorStore.getState();
    if (bridge.isDesktop) {
      const path = await bridge.saveProjectAs(s.htmlCode, s.cssCode, s.jsCode);
      if (path) {
        setCurrentFilePath(path);
        setDirty(false);
      }
    } else {
      exportProject(s.htmlCode, s.cssCode, s.jsCode, s.activeLibraries);
    }
  }, [setCurrentFilePath, setDirty]);

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      if (e.key === 'Escape' && previewFullscreen) {
        e.preventDefault();
        togglePreviewFullscreen();
        return;
      }

      if (!mod) return;

      if (e.shiftKey) {
        if (e.key === 'E' || e.key === 'e') {
          e.preventDefault();
          const s = useEditorStore.getState();
          exportProject(s.htmlCode, s.cssCode, s.jsCode, s.activeLibraries);
          return;
        }
        if (e.key === 'F' || e.key === 'f') {
          e.preventDefault();
          const pane = useEditorStore.getState().activePane;
          window.dispatchEvent(new CustomEvent('webcanvas-format', { detail: { pane } }));
          return;
        }
        if (e.key === 'C' || e.key === 'c') {
          e.preventDefault();
          toggleConsole();
          return;
        }
        if ((e.key === 'S' || e.key === 's') && isDesktop()) {
          e.preventDefault();
          handleDesktopSaveAs();
          return;
        }
      }

      // Ctrl+O — Open file (desktop only)
      if ((e.key === 'o' || e.key === 'O') && isDesktop()) {
        e.preventDefault();
        handleDesktopOpen();
        return;
      }

      // Ctrl+S — Save file
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleDesktopSave();
        return;
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
    [forceRefreshPreview, toggleLayout, setActivePane, increaseFontSize, decreaseFontSize, togglePreviewFullscreen, previewFullscreen, toggleConsole, handleDesktopOpen, handleDesktopSave, handleDesktopSaveAs],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-neutral-100">
      <TopNavbar />
      <Workspace />
      {/* Floating Tools Bar */}
      {!previewFullscreen && (
        <div className="flex items-center gap-4 px-4 py-1.5 bg-[#161b22] border-t border-[#30363d] shrink-0 overflow-x-auto">
          <ColorPicker />
          <div className="w-px h-4 bg-[#30363d] shrink-0" />
          <CssGenerator />
          <div className="w-px h-4 bg-[#30363d] shrink-0" />
          <FontPairings />
        </div>
      )}
    </div>
  );
}
