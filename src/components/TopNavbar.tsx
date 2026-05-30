import { useState, useCallback } from 'react';
import { useEditorStore } from '../store/editorStore';
import ShortcutsModal from './ShortcutsModal';
import { exportProject } from '../utils/exportProject';
import { encodeProjectToHash, copyShareUrl } from '../utils/shareUrl';
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
  { value: 'vs-dark', label: 'Dark' },
  { value: 'vs-light', label: 'Light' },
  { value: 'hc-black', label: 'High Contrast' },
];

export default function TopNavbar() {
  const [libMenuOpen, setLibMenuOpen] = useState(false);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [shareToast, setShareToast] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

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

  const handleExport = useCallback(() => {
    exportProject(htmlCode, cssCode, jsCode, activeLibraries);
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
    window.dispatchEvent(new CustomEvent('webcanvas-format', { detail: { pane } }));
  }, []);

  const handleShare = useCallback(() => {
    const s = useEditorStore.getState();
    const hash = encodeProjectToHash(s);
    window.location.hash = hash;
    copyShareUrl();
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
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
    setTemplateMenuOpen(false);
  }, [initializeStore, bumpProjectVersion]);

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
    if (projects.length <= 1) return;
    const updated = deleteProject(id);
    updateProjectsMeta(updated);
    if (id === currentProjectId && updated.length > 0) {
      handleSwitchProject(updated[0].id);
    }
  }, [projects.length, currentProjectId, updateProjectsMeta, handleSwitchProject]);

  const handleRename = useCallback((id: string) => {
    if (!renameValue.trim()) return;
    const updated = renameProject(id, renameValue.trim());
    updateProjectsMeta(updated);
    setRenamingId(null);
  }, [renameValue, updateProjectsMeta]);

  return (
    <nav className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-[#30363d] shrink-0 z-20 gap-2">
      {/* Left: Logo + Project Selector */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold shrink-0">
          LV
        </div>

        {/* Project Selector */}
        <div className="relative">
          <button
            onClick={() => setProjectMenuOpen(!projectMenuOpen)}
            className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-neutral-300 hover:text-neutral-100 rounded hover:bg-[#21262d] transition-colors max-w-[160px]"
          >
            <span className="truncate">{currentProject?.name ?? 'My Project'}</span>
            {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Unsaved changes" />}
            {!isDirty && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" title="Saved" />}
            <span className="text-[8px] text-neutral-600">▼</span>
          </button>

          {projectMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => { setProjectMenuOpen(false); setRenamingId(null); }} />
              <div className="absolute left-0 top-full mt-1 w-56 bg-[#1c2128] border border-[#30363d] rounded-lg shadow-xl z-40 overflow-hidden">
                <div className="px-3 py-2 border-b border-[#30363d] text-xs font-medium text-neutral-400">
                  Projects ({projects.length}/10)
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className={`flex items-center justify-between px-3 py-1.5 text-xs hover:bg-[#262c36] transition-colors ${
                        proj.id === currentProjectId ? 'text-indigo-300 bg-indigo-500/10' : 'text-neutral-400'
                      }`}
                    >
                      {renamingId === proj.id ? (
                        <input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleRename(proj.id); if (e.key === 'Escape') setRenamingId(null); }}
                          onBlur={() => handleRename(proj.id)}
                          className="bg-[#0d1117] border border-[#30363d] rounded px-1.5 py-0.5 text-xs text-neutral-200 outline-none w-full mr-1"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => proj.id !== currentProjectId && handleSwitchProject(proj.id)}
                          className="truncate text-left flex-1"
                        >
                          {proj.name}
                        </button>
                      )}
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setRenamingId(proj.id); setRenameValue(proj.name); }}
                          className="text-[9px] text-neutral-600 hover:text-neutral-300"
                          title="Rename"
                        >
                          ✎
                        </button>
                        {projects.length > 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteProject(proj.id); }}
                            className="text-[9px] text-neutral-600 hover:text-red-400"
                            title="Delete"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#30363d]">
                  <button
                    onClick={handleNewProject}
                    disabled={projects.length >= 10}
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
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {/* Preview Controls */}
        <button onClick={togglePreviewPaused}
          className={`px-2 py-1 text-[11px] rounded-md transition-colors whitespace-nowrap ${previewPaused ? 'bg-amber-500/20 text-amber-400' : 'bg-[#21262d] text-neutral-400 hover:text-neutral-200 hover:bg-[#30363d]'}`}
          title={previewPaused ? 'Resume' : 'Pause'}
        >
          {previewPaused ? '▶' : '⏸'}
        </button>

        <button onClick={forceRefreshPreview}
          className="px-2 py-1 text-[11px] rounded-md bg-[#21262d] text-neutral-400 hover:text-neutral-200 hover:bg-[#30363d] transition-colors"
          title="Refresh (Ctrl+Enter)"
        >↻</button>

        <div className="w-px h-4 bg-[#30363d]" />

        <button onClick={handleFormat}
          className="px-2 py-1 text-[11px] rounded-md bg-[#21262d] text-neutral-400 hover:text-neutral-200 hover:bg-[#30363d] transition-colors"
          title="Format (Ctrl+Shift+F)"
        >Format</button>

        {/* Font Size */}
        <div className="flex items-center">
          <button onClick={decreaseFontSize} className="px-1 py-1 text-[10px] rounded-l-md bg-[#21262d] text-neutral-400 hover:text-neutral-200 hover:bg-[#30363d] transition-colors border-r border-[#30363d]" title="Ctrl+-">A-</button>
          <span className="text-[9px] text-neutral-500 bg-[#21262d] px-1 py-1">{fontSize}</span>
          <button onClick={increaseFontSize} className="px-1 py-1 text-[10px] rounded-r-md bg-[#21262d] text-neutral-400 hover:text-neutral-200 hover:bg-[#30363d] transition-colors border-l border-[#30363d]" title="Ctrl+=">A+</button>
        </div>

        {/* Theme */}
        <select value={editorTheme} onChange={(e) => setEditorTheme(e.target.value as EditorTheme)}
          className="text-[10px] bg-[#21262d] border border-[#30363d] rounded-md px-1.5 py-1 text-neutral-400 outline-none cursor-pointer"
        >
          {THEME_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <div className="w-px h-4 bg-[#30363d]" />

        {/* Layout + Fullscreen */}
        <button onClick={toggleLayout}
          className="px-2 py-1 text-[11px] rounded-md bg-[#21262d] text-neutral-400 hover:text-neutral-200 hover:bg-[#30363d] transition-colors whitespace-nowrap"
          title="Toggle layout (Ctrl+\\)"
        >{layoutOrientation === 'vertical' ? '⬒' : '⬓'}</button>

        <button onClick={togglePreviewFullscreen}
          className={`px-2 py-1 text-[11px] rounded-md transition-colors ${previewFullscreen ? 'bg-indigo-500/20 text-indigo-300' : 'bg-[#21262d] text-neutral-400 hover:text-neutral-200 hover:bg-[#30363d]'}`}
          title={previewFullscreen ? 'Exit fullscreen' : 'Fullscreen preview'}
        >{previewFullscreen ? '⊟' : '⊞'}</button>

        <div className="w-px h-4 bg-[#30363d]" />

        {/* Templates */}
        <div className="relative">
          <button onClick={() => setTemplateMenuOpen(!templateMenuOpen)}
            className="px-2 py-1 text-[11px] rounded-md bg-[#21262d] text-neutral-400 hover:text-neutral-200 hover:bg-[#30363d] transition-colors whitespace-nowrap"
          >Templates</button>
          {templateMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setTemplateMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-56 bg-[#1c2128] border border-[#30363d] rounded-lg shadow-xl z-40 overflow-hidden">
                <div className="px-3 py-2 border-b border-[#30363d] text-xs font-medium text-neutral-400">Starter Templates</div>
                {TEMPLATES.map((t) => (
                  <button key={t.id} onClick={() => handleTemplateSelect(t.id)}
                    className="w-full px-3 py-2 text-left text-xs text-neutral-400 hover:bg-[#262c36] hover:text-neutral-200 transition-colors"
                  >
                    <span className="font-medium">{t.name}</span>
                    <span className="text-[10px] text-neutral-600 ml-1.5">{t.description}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Libraries */}
        <div className="relative">
          <button onClick={() => setLibMenuOpen(!libMenuOpen)}
            className="px-2 py-1 text-[11px] rounded-md bg-[#21262d] text-neutral-400 hover:text-neutral-200 hover:bg-[#30363d] transition-colors whitespace-nowrap"
          >
            Libs{activeLibraries.length > 0 && (
              <span className="ml-1 px-1 text-[9px] rounded-full bg-indigo-500/30 text-indigo-300">{activeLibraries.length}</span>
            )}
          </button>
          {libMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setLibMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-60 bg-[#1c2128] border border-[#30363d] rounded-lg shadow-xl z-40 overflow-hidden">
                <div className="px-3 py-2 border-b border-[#30363d] text-xs font-medium text-neutral-400">CDN Libraries</div>
                <div className="max-h-64 overflow-y-auto">
                  {CDN_REGISTRY.map((lib: CDNLibrary) => {
                    const isActive = activeLibraries.some((l) => l.id === lib.id);
                    return (
                      <button key={lib.id} onClick={() => toggleLibrary(lib)}
                        className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-[#262c36] transition-colors ${isActive ? 'text-indigo-300' : 'text-neutral-400'}`}
                      >
                        <span>{lib.name} <span className="text-[10px] text-neutral-600">v{lib.version}</span></span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${lib.category === 'css' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {lib.category.toUpperCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="w-px h-4 bg-[#30363d]" />

        {/* Share */}
        <div className="relative">
          <button onClick={handleShare}
            className="px-2 py-1 text-[11px] rounded-md bg-[#21262d] text-neutral-400 hover:text-neutral-200 hover:bg-[#30363d] transition-colors"
            title="Copy shareable link"
          >Share</button>
          {shareToast && (
            <div className="absolute right-0 top-full mt-1 px-3 py-1.5 bg-emerald-600 text-white text-[10px] rounded shadow-lg z-50 whitespace-nowrap">
              Link copied!
            </div>
          )}
        </div>

        {/* Export */}
        <button onClick={handleExport}
          className="px-2 py-1 text-[11px] rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors whitespace-nowrap"
          title="Export ZIP (Ctrl+Shift+E)"
        >Export</button>

        {/* Reset */}
        <button onClick={handleReset}
          className={`px-2 py-1 text-[11px] rounded-md transition-colors whitespace-nowrap ${showResetConfirm ? 'bg-red-600 text-white' : 'bg-[#21262d] text-neutral-400 hover:text-red-400 hover:bg-[#30363d]'}`}
        >{showResetConfirm ? 'Confirm?' : 'Reset'}</button>

        <div className="w-px h-4 bg-[#30363d]" />

        {/* Help */}
        <button
          onClick={() => setShortcutsOpen(true)}
          className="w-6 h-6 text-[11px] rounded-md bg-[#21262d] text-neutral-500 hover:text-neutral-200 hover:bg-[#30363d] transition-colors flex items-center justify-center"
          title="Keyboard shortcuts"
        >
          ?
        </button>
      </div>

      {shortcutsOpen && <ShortcutsModal onClose={() => setShortcutsOpen(false)} />}
    </nav>
  );
}
