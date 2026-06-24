import { useState, useCallback, useRef } from 'react';
import { useEditorStore } from '../store/editorStore';
import ShortcutsModal from './ShortcutsModal';
import DropdownPortal from './DropdownPortal';
import MenuHintHeader from './MenuHintHeader';
import { HoverTip, TipButton } from './HoverTip';
import { exportProject } from '../utils/exportProject';
import { encodeProjectToHash, copyShareUrl } from '../utils/shareUrl';
import { NAV_HINTS, LIB_HINTS } from '../constants/uiHints';
import {
  createProject,
  deleteProject,
  renameProject,
  loadProjectData,
  saveProjectData,
  touchProject,
} from '../utils/projectManager';
import { CDN_REGISTRY } from '../utils/cdnRegistry';
import { TEMPLATES } from '../constants/templates';
import type { CDNLibrary, EditorTheme } from '../types/editor.types';

const THEME_OPTIONS: { value: EditorTheme; label: string }[] = [
  { value: 'vs-dark', label: 'Dark (editor + UI)' },
  { value: 'vs-light', label: 'Light (editor + UI)' },
  { value: 'hc-black', label: 'High contrast' },
];

export default function TopNavbar() {
  const [libMenuOpen, setLibMenuOpen] = useState(false);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const templateBtnRef = useRef<HTMLButtonElement>(null);
  const libBtnRef = useRef<HTMLButtonElement>(null);

  const htmlCode = useEditorStore((s) => s.htmlCode);
  const cssCode = useEditorStore((s) => s.cssCode);
  const jsCode = useEditorStore((s) => s.jsCode);
  const activeLibraries = useEditorStore((s) => s.activeLibraries);
  const layoutOrientation = useEditorStore((s) => s.layoutOrientation);
  const previewPaused = useEditorStore((s) => s.previewPaused);
  const previewFullscreen = useEditorStore((s) => s.previewFullscreen);
  const editorTheme = useEditorStore((s) => s.editorTheme);
  const fontSize = useEditorStore((s) => s.fontSize);
  const currentProjectId = useEditorStore((s) => s.currentProjectId);
  const projects = useEditorStore((s) => s.projects);
  const isDirty = useEditorStore((s) => s.isDirty);

  const toggleLayout = useEditorStore((s) => s.toggleLayout);
  const toggleLibrary = useEditorStore((s) => s.toggleLibrary);
  const resetProject = useEditorStore((s) => s.resetProject);
  const togglePreviewPaused = useEditorStore((s) => s.togglePreviewPaused);
  const forceRefreshPreview = useEditorStore((s) => s.forceRefreshPreview);
  const togglePreviewFullscreen = useEditorStore((s) => s.togglePreviewFullscreen);
  const setEditorTheme = useEditorStore((s) => s.setEditorTheme);
  const increaseFontSize = useEditorStore((s) => s.increaseFontSize);
  const decreaseFontSize = useEditorStore((s) => s.decreaseFontSize);
  const initializeStore = useEditorStore((s) => s.initializeStore);
  const setCurrentProject = useEditorStore((s) => s.setCurrentProject);
  const updateProjectsMeta = useEditorStore((s) => s.updateProjectsMeta);
  const bumpProjectVersion = useEditorStore((s) => s.bumpProjectVersion);

  const currentProject = projects.find((p) => p.id === currentProjectId);

  const handleExport = useCallback(async () => {
    await exportProject(htmlCode, cssCode, jsCode, activeLibraries);
    setExportToast('ZIP exported!');
    setTimeout(() => setExportToast(null), 2000);
  }, [htmlCode, cssCode, jsCode, activeLibraries]);

  const handleReset = useCallback(() => {
    if (showResetConfirm) {
      resetProject();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  }, [showResetConfirm, resetProject]);

  const handleFormat = useCallback(() => {
    const pane = useEditorStore.getState().activePane;
    window.dispatchEvent(new CustomEvent('liveview-format', { detail: { pane } }));
  }, []);

  const handleShare = useCallback(async () => {
    const s = useEditorStore.getState();
    const hash = encodeProjectToHash(s);
    const ok = await copyShareUrl(hash);
    setShareToast(ok ? 'Link copied!' : 'Could not copy link');
    setTimeout(() => setShareToast(null), 2500);
  }, []);

  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    const s = useEditorStore.getState();
    saveProjectData(s.currentProjectId, {
      htmlCode: s.htmlCode, cssCode: s.cssCode, jsCode: s.jsCode,
      activeLibraries: s.activeLibraries,
    });

    initializeStore({
      htmlCode: template.html,
      cssCode: template.css,
      jsCode: template.js,
      activeLibraries: template.libraries,
    });
    bumpProjectVersion();
    forceRefreshPreview();
    setTemplateMenuOpen(false);

    const updated = useEditorStore.getState();
    saveProjectData(updated.currentProjectId, {
      htmlCode: updated.htmlCode,
      cssCode: updated.cssCode,
      jsCode: updated.jsCode,
      activeLibraries: updated.activeLibraries,
    });
  }, [initializeStore, bumpProjectVersion, forceRefreshPreview]);

  const handleSwitchProject = useCallback((id: string) => {
    const s = useEditorStore.getState();
    saveProjectData(s.currentProjectId, {
      htmlCode: s.htmlCode, cssCode: s.cssCode, jsCode: s.jsCode,
      activeLibraries: s.activeLibraries,
      fontPairingId: s.fontPairingId, customHeadingFont: s.customHeadingFont, customBodyFont: s.customBodyFont,
    });
    touchProject(s.currentProjectId);

    const data = loadProjectData(id);
    if (data) {
      initializeStore({
        htmlCode: data.htmlCode, cssCode: data.cssCode, jsCode: data.jsCode,
        activeLibraries: data.activeLibraries as CDNLibrary[],
        fontPairingId: data.fontPairingId, customHeadingFont: data.customHeadingFont, customBodyFont: data.customBodyFont,
      });
    } else {
      initializeStore({ htmlCode: '', cssCode: '', jsCode: '', activeLibraries: [] });
    }
    setCurrentProject(id);
    bumpProjectVersion();
    setProjectMenuOpen(false);
  }, [initializeStore, setCurrentProject, bumpProjectVersion]);

  const handleNewProject = useCallback(() => {
    try {
      const s = useEditorStore.getState();
      saveProjectData(s.currentProjectId, {
        htmlCode: s.htmlCode, cssCode: s.cssCode, jsCode: s.jsCode,
        activeLibraries: s.activeLibraries,
      });

      const { meta, projects: updated } = createProject('Untitled');
      updateProjectsMeta(updated);
      initializeStore({ htmlCode: '', cssCode: '', jsCode: '', activeLibraries: [] });
      setCurrentProject(meta.id);
      bumpProjectVersion();
      setProjectMenuOpen(false);
    } catch {
      // max projects reached
    }
  }, [initializeStore, setCurrentProject, updateProjectsMeta, bumpProjectVersion]);

  const handleDeleteProject = useCallback((id: string) => {
    const { projects, currentProjectId } = useEditorStore.getState();
    if (projects.length <= 1) return;
    const updated = deleteProject(id);
    updateProjectsMeta(updated);
    if (id === currentProjectId && updated.length > 0) {
      handleSwitchProject(updated[0].id);
    }
  }, [updateProjectsMeta, handleSwitchProject]);

  const handleRename = useCallback((id: string) => {
    if (!renameValue.trim()) return;
    const updated = renameProject(id, renameValue.trim());
    updateProjectsMeta(updated);
    setRenamingId(null);
  }, [renameValue, updateProjectsMeta]);

  return (
    <nav className="flex items-center justify-between px-3 py-1.5 ui-bg-panel border-b border ui-border shrink-0 z-50 gap-2 overflow-visible">
      {/* Left: Logo + Project Selector */}
      <div className="flex items-center gap-2 shrink-0">
        <HoverTip tip="Gnomad Webcanvas — live HTML/CSS/JS editor.">
          <div
            className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[9px] font-bold shrink-0"
            title="Gnomad Webcanvas"
          >
            WC
          </div>
        </HoverTip>

        {/* Project Selector */}
        <div className="relative">
          <HoverTip tip={NAV_HINTS.project}>
            <button
              type="button"
              onClick={() => setProjectMenuOpen(!projectMenuOpen)}
              title={NAV_HINTS.project}
              className="flex items-center gap-1 px-2 py-1 text-sm font-medium ui-text hover:text-neutral-100 rounded hover:ui-bg-elevated transition-colors max-w-[160px]"
            >
            <span className="truncate">{currentProject?.name ?? 'My Project'}</span>
            {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Unsaved changes" />}
            {!isDirty && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" title="Saved" />}
            <span className="text-[8px] ui-text-faint">▼</span>
            </button>
          </HoverTip>

          {projectMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => { setProjectMenuOpen(false); setRenamingId(null); }} />
              <div className="absolute left-0 top-full mt-1 w-64 ui-bg-menu border ui-border rounded-lg shadow-xl z-40 overflow-hidden">
                <MenuHintHeader
                  title={`Projects (${projects.length}/10)`}
                  hint={NAV_HINTS.project}
                />
                <div className="max-h-52 overflow-y-auto">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className={`flex items-center justify-between px-3 py-1.5 text-xs hover:bg-[#262c36] transition-colors ${
                        proj.id === currentProjectId ? 'text-indigo-300 bg-indigo-500/10' : 'ui-text-muted'
                      }`}
                    >
                      {renamingId === proj.id ? (
                        <input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleRename(proj.id); if (e.key === 'Escape') setRenamingId(null); }}
                          onBlur={() => handleRename(proj.id)}
                          className="ui-bg-base border ui-border rounded px-1.5 py-0.5 text-xs ui-text outline-none w-full mr-1"
                          autoFocus
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => proj.id !== currentProjectId && handleSwitchProject(proj.id)}
                          title={NAV_HINTS.projectSwitch}
                          className="truncate text-left flex-1"
                        >
                          {proj.name}
                        </button>
                      )}
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setRenamingId(proj.id); setRenameValue(proj.name); }}
                          className="text-[9px] ui-text-faint hover:ui-text"
                          title={NAV_HINTS.projectRename}
                        >
                          ✎
                        </button>
                        {projects.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteProject(proj.id); }}
                            className="text-[9px] ui-text-faint hover:text-red-400"
                            title={NAV_HINTS.projectDelete}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border ui-border">
                  <button
                    type="button"
                    onClick={handleNewProject}
                    disabled={projects.length >= 10}
                    title={NAV_HINTS.projectNew}
                    className="w-full px-3 py-2 text-xs text-indigo-400 hover:bg-[#262c36] transition-colors disabled:opacity-30 text-left"
                  >
                    + New Project
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto overflow-y-visible">
        {/* Preview Controls */}
        <TipButton
          tip={previewPaused ? NAV_HINTS.resume : NAV_HINTS.pause}
          onClick={togglePreviewPaused}
          className={`px-2 py-1 text-[11px] rounded-md transition-colors whitespace-nowrap ${previewPaused ? 'bg-amber-500/20 text-amber-400' : 'ui-bg-elevated ui-text-muted hover:ui-text hover:bg-[var(--ui-border)]'}`}
        >
          {previewPaused ? '▶' : '⏸'}
        </TipButton>

        <TipButton
          tip={NAV_HINTS.refresh}
          shortcut="Ctrl+Enter"
          onClick={forceRefreshPreview}
          className="px-2 py-1 text-[11px] rounded-md ui-bg-elevated ui-text-muted hover:ui-text hover:bg-[var(--ui-border)] transition-colors"
        >
          ↻
        </TipButton>

        <div className="w-px h-4 bg-[#30363d]" />

        <TipButton
          tip={NAV_HINTS.format}
          shortcut="Ctrl+Shift+F"
          onClick={handleFormat}
          className="px-2 py-1 text-[11px] rounded-md ui-bg-elevated ui-text-muted hover:ui-text hover:bg-[var(--ui-border)] transition-colors"
        >
          Format
        </TipButton>

        {/* Font Size */}
        <div className="flex items-center">
          <TipButton
            tip={NAV_HINTS.fontDecrease}
            shortcut="Ctrl+-"
            onClick={decreaseFontSize}
            className="px-1 py-1 text-[10px] rounded-l-md ui-bg-elevated ui-text-muted hover:ui-text hover:bg-[var(--ui-border)] transition-colors border-r border ui-border"
          >
            A-
          </TipButton>
          <HoverTip tip={NAV_HINTS.fontSize}>
            <span className="text-[9px] ui-text-faint ui-bg-elevated px-1 py-1">{fontSize}</span>
          </HoverTip>
          <TipButton
            tip={NAV_HINTS.fontIncrease}
            shortcut="Ctrl+="
            onClick={increaseFontSize}
            className="px-1 py-1 text-[10px] rounded-r-md ui-bg-elevated ui-text-muted hover:ui-text hover:bg-[var(--ui-border)] transition-colors border-l border ui-border"
          >
            A+
          </TipButton>
        </div>

        {/* Theme */}
        <HoverTip tip={NAV_HINTS.theme}>
          <select
            value={editorTheme}
            onChange={(e) => setEditorTheme(e.target.value as EditorTheme)}
            title={NAV_HINTS.theme}
            className="text-[10px] ui-bg-elevated border ui-border rounded-md px-1.5 py-1 ui-text-muted outline-none cursor-pointer"
          >
            {THEME_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </HoverTip>

        <div className="w-px h-4 bg-[#30363d]" />

        {/* Layout + Fullscreen */}
        <TipButton
          tip={NAV_HINTS.layout}
          shortcut="Ctrl+\\"
          onClick={toggleLayout}
          className="px-2 py-1 text-[11px] rounded-md ui-bg-elevated ui-text-muted hover:ui-text hover:bg-[var(--ui-border)] transition-colors whitespace-nowrap"
        >
          {layoutOrientation === 'vertical' ? '⬒' : '⬓'}
        </TipButton>

        <TipButton
          tip={previewFullscreen ? NAV_HINTS.exitFullscreen : NAV_HINTS.fullscreen}
          shortcut="Escape"
          onClick={togglePreviewFullscreen}
          className={`px-2 py-1 text-[11px] rounded-md transition-colors ${previewFullscreen ? 'bg-indigo-500/20 text-indigo-300' : 'ui-bg-elevated ui-text-muted hover:ui-text hover:bg-[var(--ui-border)]'}`}
        >
          {previewFullscreen ? '⊟' : '⊞'}
        </TipButton>

        <div className="w-px h-4 bg-[#30363d]" />

        {/* Templates */}
        <div className="relative shrink-0">
          <HoverTip tip={NAV_HINTS.templates}>
            <button
              ref={templateBtnRef}
              type="button"
              title={NAV_HINTS.templates}
              onClick={() => {
                setLibMenuOpen(false);
                setTemplateMenuOpen((open) => !open);
              }}
              className="px-2 py-1 text-[11px] rounded-md ui-bg-elevated ui-text-muted hover:ui-text hover:bg-[var(--ui-border)] transition-colors whitespace-nowrap"
            >
              Templates
            </button>
          </HoverTip>
          <DropdownPortal
            open={templateMenuOpen}
            onClose={() => setTemplateMenuOpen(false)}
            anchorRef={templateBtnRef}
            width={260}
          >
            <MenuHintHeader title="Starter Templates" hint={NAV_HINTS.templatesMenu} />
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTemplateSelect(t.id)}
                title={t.description}
                className="w-full px-3 py-2 text-left text-xs ui-text-muted hover:bg-[#262c36] hover:ui-text transition-colors"
              >
                <span className="block font-medium">{t.name}</span>
                <span className="block text-[10px] ui-text-faint mt-0.5 leading-snug">{t.description}</span>
              </button>
            ))}
          </DropdownPortal>
        </div>

        {/* Libraries */}
        <div className="relative shrink-0">
          <HoverTip tip={NAV_HINTS.libs}>
            <button
              ref={libBtnRef}
              type="button"
              title={NAV_HINTS.libs}
              onClick={() => {
                setTemplateMenuOpen(false);
                setLibMenuOpen((open) => !open);
              }}
              className="px-2 py-1 text-[11px] rounded-md ui-bg-elevated ui-text-muted hover:ui-text hover:bg-[var(--ui-border)] transition-colors whitespace-nowrap"
            >
              Libs{activeLibraries.length > 0 && (
                <span className="ml-1 px-1 text-[9px] rounded-full bg-indigo-500/30 text-indigo-300">{activeLibraries.length}</span>
              )}
            </button>
          </HoverTip>
          <DropdownPortal
            open={libMenuOpen}
            onClose={() => setLibMenuOpen(false)}
            anchorRef={libBtnRef}
            width={280}
          >
            <MenuHintHeader title="CDN Libraries" hint={NAV_HINTS.libsMenu} />
            <div className="max-h-64 overflow-y-auto">
              {CDN_REGISTRY.map((lib: CDNLibrary) => {
                const isActive = activeLibraries.some((l) => l.id === lib.id);
                const libHint = LIB_HINTS[lib.id];
                return (
                  <button
                    key={lib.id}
                    type="button"
                    title={libHint}
                    onClick={() => {
                      toggleLibrary(lib);
                      forceRefreshPreview();
                    }}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-[#262c36] transition-colors ${isActive ? 'text-indigo-300' : 'ui-text-muted'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="block font-medium">
                          {lib.name}{' '}
                          <span className="text-[10px] ui-text-faint font-normal">v{lib.version}</span>
                        </span>
                        {libHint && (
                          <span className="block text-[10px] ui-text-faint mt-0.5 leading-snug">{libHint}</span>
                        )}
                      </div>
                      <span
                        className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded ${lib.category === 'css' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}
                      >
                        {isActive ? 'ON' : lib.category.toUpperCase()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </DropdownPortal>
        </div>

        <div className="w-px h-4 bg-[#30363d]" />

        {/* Share */}
        <div className="relative shrink-0">
          <TipButton
            tip={NAV_HINTS.share}
            onClick={() => void handleShare()}
            className="px-2 py-1 text-[11px] rounded-md ui-bg-elevated ui-text-muted hover:ui-text hover:bg-[var(--ui-border)] transition-colors"
          >
            Share
          </TipButton>
          {shareToast && (
            <div
              className={`fixed z-[10000] px-3 py-1.5 text-white text-[10px] rounded shadow-lg whitespace-nowrap pointer-events-none ${
                shareToast === 'Link copied!' ? 'bg-emerald-600' : 'bg-red-600'
              }`}
              style={{
                top: (libBtnRef.current?.getBoundingClientRect().bottom ?? 48) + 6,
                right: 16,
              }}
            >
              {shareToast}
            </div>
          )}
        </div>

        {/* Export */}
        <div className="relative shrink-0">
          <TipButton
            tip={NAV_HINTS.export}
            shortcut="Ctrl+Shift+E"
            onClick={() => void handleExport()}
            className="px-2 py-1 text-[11px] rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors whitespace-nowrap"
          >
            Export
          </TipButton>
          {exportToast && (
            <div className="absolute right-0 top-full mt-1 px-3 py-1.5 bg-emerald-600 text-white text-[10px] rounded shadow-lg z-50 whitespace-nowrap">
              {exportToast}
            </div>
          )}
        </div>

        {/* Reset */}
        <TipButton
          tip={showResetConfirm ? NAV_HINTS.resetConfirm : NAV_HINTS.reset}
          onClick={handleReset}
          className={`px-2 py-1 text-[11px] rounded-md transition-colors whitespace-nowrap ${showResetConfirm ? 'bg-red-600 text-white' : 'ui-bg-elevated ui-text-muted hover:text-red-400 hover:bg-[var(--ui-border)]'}`}
        >
          {showResetConfirm ? 'Confirm?' : 'Reset'}
        </TipButton>

        <div className="w-px h-4 bg-[#30363d]" />

        {/* Help */}
        <TipButton
          tip={NAV_HINTS.help}
          onClick={() => setShortcutsOpen(true)}
          className="w-6 h-6 text-[11px] rounded-md ui-bg-elevated ui-text-faint hover:ui-text hover:bg-[var(--ui-border)] transition-colors flex items-center justify-center"
        >
          ?
        </TipButton>
      </div>

      {shortcutsOpen && <ShortcutsModal onClose={() => setShortcutsOpen(false)} />}
    </nav>
  );
}
