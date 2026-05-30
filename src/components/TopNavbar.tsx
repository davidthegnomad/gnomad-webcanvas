import { useState, useCallback, useEffect, useRef, type MouseEvent } from 'react';
import { useEditorStore } from '../store/editorStore';
import ShortcutsModal from './ShortcutsModal';
import AboutModal from './AboutModal';
import { exportProject } from '../utils/exportProject';
import { encodeProjectToHash, copyShareUrl } from '../utils/shareUrl';
import {
  createProject,
  deleteProject,
  renameProject,
  loadProjectData,
  saveProjectData,
  touchProject,
  getDefaultProjectData,
  isEmptyProjectData,
} from '../utils/projectManager';
import { CDN_REGISTRY } from '../utils/cdnRegistry';
import { TEMPLATES, type Template } from '../constants/templates';
import {
  deleteUserTemplate,
  isUserTemplate,
  loadUserTemplates,
  saveUserTemplate,
} from '../utils/templateManager';
import { getPlatformBridge, isDesktop } from '../utils/platformBridge';
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
  const [aboutOpen, setAboutOpen] = useState(false);
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [templateError, setTemplateError] = useState<string | null>(null);
  const resetConfirmTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (resetConfirmTimer.current !== null) {
      window.clearTimeout(resetConfirmTimer.current);
    }
  }, []);

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
  const setCurrentFilePath = useEditorStore((s) => s.setCurrentFilePath);
  const setDirty = useEditorStore((s) => s.setDirty);

  const currentProject = projects.find((p) => p.id === currentProjectId);

  const handleExport = useCallback(() => {
    exportProject(htmlCode, cssCode, jsCode, activeLibraries);
  }, [htmlCode, cssCode, jsCode, activeLibraries]);

  const handleReset = useCallback(() => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      resetConfirmTimer.current = window.setTimeout(() => setShowResetConfirm(false), 3000);
      return;
    }

    if (resetConfirmTimer.current !== null) {
      window.clearTimeout(resetConfirmTimer.current);
      resetConfirmTimer.current = null;
    }
    setShowResetConfirm(false);
    const defaults = getDefaultProjectData();
    const projectId = useEditorStore.getState().currentProjectId;

    resetProject();
    saveProjectData(projectId, defaults);
    setDirty(false);
  }, [showResetConfirm, resetProject, setDirty]);

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

  const applyTemplate = useCallback((template: Template) => {
    const s = useEditorStore.getState();
    saveProjectData(s.currentProjectId, {
      htmlCode: s.htmlCode,
      cssCode: s.cssCode,
      jsCode: s.jsCode,
      activeLibraries: s.activeLibraries,
    });

    initializeStore({
      htmlCode: template.html,
      cssCode: template.css,
      jsCode: template.js,
      activeLibraries: template.libraries,
      fontPairingId: null,
      customHeadingFont: null,
      customBodyFont: null,
    });
    saveProjectData(s.currentProjectId, {
      htmlCode: template.html,
      cssCode: template.css,
      jsCode: template.js,
      activeLibraries: template.libraries,
    });
    setCurrentFilePath(null);
    bumpProjectVersion();
    forceRefreshPreview();
    setTemplateMenuOpen(false);
  }, [initializeStore, bumpProjectVersion, forceRefreshPreview, setCurrentFilePath]);

  const handleTemplateSelect = useCallback((templateId: string) => {
    const template =
      TEMPLATES.find((t) => t.id === templateId) ??
      userTemplates.find((t) => t.id === templateId);
    if (template) applyTemplate(template);
  }, [userTemplates, applyTemplate]);

  useEffect(() => {
    if (templateMenuOpen) {
      setUserTemplates(loadUserTemplates());
      setTemplateError(null);
    }
  }, [templateMenuOpen]);

  const handleSaveTemplate = useCallback(() => {
    const name = newTemplateName.trim();
    if (!name) {
      setTemplateError('Enter a template name');
      return;
    }

    try {
      saveUserTemplate({
        name,
        html: htmlCode,
        css: cssCode,
        js: jsCode,
        libraries: activeLibraries,
      });
      setUserTemplates(loadUserTemplates());
      setNewTemplateName('');
      setSaveTemplateOpen(false);
      setTemplateError(null);
      setTemplateMenuOpen(true);
    } catch (err) {
      setTemplateError(err instanceof Error ? err.message : 'Could not save template');
    }
  }, [newTemplateName, htmlCode, cssCode, jsCode, activeLibraries]);

  const handleDeleteUserTemplate = useCallback((id: string, e: MouseEvent) => {
    e.stopPropagation();
    setUserTemplates(deleteUserTemplate(id));
  }, []);

  const handleSwitchProject = useCallback((id: string) => {
    const s = useEditorStore.getState();
    saveProjectData(s.currentProjectId, {
      htmlCode: s.htmlCode, cssCode: s.cssCode, jsCode: s.jsCode,
      activeLibraries: s.activeLibraries,
      fontPairingId: s.fontPairingId, customHeadingFont: s.customHeadingFont, customBodyFont: s.customBodyFont,
    });
    touchProject(s.currentProjectId);

    const data = loadProjectData(id);
    const projectData = data && !isEmptyProjectData(data)
      ? data
      : getDefaultProjectData();
    initializeStore({
      htmlCode: projectData.htmlCode,
      cssCode: projectData.cssCode,
      jsCode: projectData.jsCode,
      activeLibraries: projectData.activeLibraries as CDNLibrary[],
      fontPairingId: projectData.fontPairingId,
      customHeadingFont: projectData.customHeadingFont,
      customBodyFont: projectData.customBodyFont,
    });
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
      initializeStore({
        ...getDefaultProjectData(),
        activeLibraries: [],
      });
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

  const handleDesktopOpen = useCallback(async () => {
    const bridge = await getPlatformBridge();
    if (!bridge.isDesktop) return;
    const result = await bridge.openProject();
    if (!result) return;

    const s = useEditorStore.getState();
    saveProjectData(s.currentProjectId, {
      htmlCode: s.htmlCode,
      cssCode: s.cssCode,
      jsCode: s.jsCode,
      activeLibraries: s.activeLibraries,
    });

    initializeStore({
      htmlCode: result.html,
      cssCode: result.css,
      jsCode: result.js,
      activeLibraries: [],
    });
    setCurrentFilePath(result.filePath ?? null);
    setDirty(false);
    bumpProjectVersion();
  }, [initializeStore, setCurrentFilePath, setDirty, bumpProjectVersion]);

  return (
    <nav className="wc-shell flex items-center justify-between px-3 py-1.5 bg-wc-surface border-b border-wc shrink-0 z-20 gap-2">
      {/* Left: Logo + Project Selector */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setAboutOpen(true)}
          className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold shrink-0 hover:opacity-90 transition-opacity"
          title="About Webcanvas"
        >
          WC
        </button>

        {/* Project Selector */}
        <div className="relative">
          <button
            onClick={() => setProjectMenuOpen(!projectMenuOpen)}
            className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-neutral-300 hover:text-neutral-100 rounded hover:bg-wc-elevated transition-colors max-w-[160px]"
          >
            <span className="truncate">{currentProject?.name ?? 'My Project'}</span>
            {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Unsaved changes" />}
            {!isDirty && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" title="Saved" />}
            <span className="text-[8px] text-neutral-600">▼</span>
          </button>

          {projectMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => { setProjectMenuOpen(false); setRenamingId(null); }} />
              <div className="absolute left-0 top-full mt-1 w-56 bg-wc-surface border border-wc rounded-lg shadow-xl z-40 overflow-hidden">
                <div className="px-3 py-2 border-b border-wc text-xs font-medium text-neutral-400">
                  Projects ({projects.length}/10)
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className={`flex items-center justify-between px-3 py-1.5 text-xs hover:bg-wc-hover transition-colors ${
                        proj.id === currentProjectId ? 'text-indigo-300 bg-indigo-500/10' : 'text-neutral-400'
                      }`}
                    >
                      {renamingId === proj.id ? (
                        <input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleRename(proj.id); if (e.key === 'Escape') setRenamingId(null); }}
                          onBlur={() => handleRename(proj.id)}
                          className="bg-wc-input border border-wc rounded px-1.5 py-0.5 text-xs text-neutral-200 outline-none w-full mr-1"
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
                <div className="border-t border-wc">
                  <button
                    onClick={handleNewProject}
                    disabled={projects.length >= 10}
                    className="w-full px-3 py-2 text-xs text-indigo-400 hover:bg-wc-hover transition-colors disabled:opacity-30 text-left"
                  >
                    + New Project
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Controls — dropdown menus stay outside overflow scroll so menus aren't clipped */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end overflow-visible">
        <div className="flex items-center gap-1.5 overflow-x-auto overflow-y-visible max-w-full">
        {/* Preview Controls */}
        <button onClick={togglePreviewPaused}
          className={`px-2 py-1 text-[11px] rounded-md transition-colors whitespace-nowrap ${previewPaused ? 'bg-amber-500/20 text-amber-400' : 'bg-wc-elevated text-neutral-400 hover:text-neutral-200 hover:bg-wc-hover'}`}
          title={previewPaused ? 'Resume' : 'Pause'}
        >
          {previewPaused ? '▶' : '⏸'}
        </button>

        <button onClick={forceRefreshPreview}
          className="px-2 py-1 text-[11px] rounded-md bg-wc-elevated text-neutral-400 hover:text-neutral-200 hover:bg-wc-hover transition-colors"
          title="Refresh (Ctrl+Enter)"
        >↻</button>

        <div className="w-px h-4 bg-wc-border" />

        <button onClick={handleFormat}
          className="px-2 py-1 text-[11px] rounded-md bg-wc-elevated text-neutral-400 hover:text-neutral-200 hover:bg-wc-hover transition-colors"
          title="Format (Ctrl+Shift+F)"
        >Format</button>

        {/* Font Size */}
        <div className="flex items-center">
          <button onClick={decreaseFontSize} className="px-1 py-1 text-[10px] rounded-l-md bg-wc-elevated text-neutral-400 hover:text-neutral-200 hover:bg-wc-hover transition-colors border-r border-wc" title="Ctrl+-">A-</button>
          <span className="text-[9px] text-neutral-500 bg-wc-elevated px-1 py-1">{fontSize}</span>
          <button onClick={increaseFontSize} className="px-1 py-1 text-[10px] rounded-r-md bg-wc-elevated text-neutral-400 hover:text-neutral-200 hover:bg-wc-hover transition-colors border-l border-wc" title="Ctrl+=">A+</button>
        </div>

        {/* Theme */}
        <select
          value={editorTheme}
          onChange={(e) => setEditorTheme(e.target.value as EditorTheme)}
          className="text-[10px] bg-wc-elevated border border-wc rounded-md px-1.5 py-1 text-wc-muted outline-none cursor-pointer"
          title="Editor and app theme"
        >
          {THEME_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <div className="w-px h-4 bg-wc-border" />

        {/* Layout + Fullscreen */}
        <button onClick={toggleLayout}
          className="px-2 py-1 text-[11px] rounded-md bg-wc-elevated text-neutral-400 hover:text-neutral-200 hover:bg-wc-hover transition-colors whitespace-nowrap"
          title="Toggle layout (Ctrl+\\)"
        >{layoutOrientation === 'vertical' ? '⬒' : '⬓'}</button>

        <button onClick={togglePreviewFullscreen}
          className={`px-2 py-1 text-[11px] rounded-md transition-colors ${previewFullscreen ? 'bg-indigo-500/20 text-indigo-300' : 'bg-wc-elevated text-neutral-400 hover:text-neutral-200 hover:bg-wc-hover'}`}
          title={previewFullscreen ? 'Exit fullscreen' : 'Fullscreen preview'}
        >{previewFullscreen ? '⊟' : '⊞'}</button>

        <div className="w-px h-4 bg-wc-border" />
        </div>

        {/* Templates — outside scroll container so dropdown is visible */}
        <div className="relative shrink-0">
          <button
            onClick={() => { setTemplateMenuOpen(!templateMenuOpen); setLibMenuOpen(false); }}
            className={`px-2 py-1 text-[11px] rounded-md transition-colors whitespace-nowrap ${
              templateMenuOpen ? 'bg-indigo-500/20 text-indigo-300' : 'bg-wc-elevated text-neutral-400 hover:text-neutral-200 hover:bg-wc-hover'
            }`}
            title="Load a starter site template"
          >
            Templates
          </button>
          {templateMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => { setTemplateMenuOpen(false); setSaveTemplateOpen(false); }} />
              <div className="absolute right-0 top-full mt-1 w-72 bg-wc-surface border border-wc rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-wc">
                  <div className="text-xs font-medium text-neutral-300">Templates</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Replaces current HTML, CSS &amp; JS</div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[10px] font-medium text-neutral-500 uppercase tracking-wider bg-wc-app/40">
                    Built-in
                  </div>
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleTemplateSelect(t.id)}
                      className="w-full px-3 py-2.5 text-left hover:bg-wc-hover transition-colors border-b border-wc/50"
                    >
                      <div className="text-xs font-medium text-neutral-200">{t.name}</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">{t.description}</div>
                    </button>
                  ))}
                  {userTemplates.length > 0 && (
                    <>
                      <div className="px-3 py-1.5 text-[10px] font-medium text-neutral-500 uppercase tracking-wider bg-wc-app/40">
                        Your Templates
                      </div>
                      {userTemplates.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center border-b border-wc/50 hover:bg-wc-hover transition-colors"
                        >
                          <button
                            onClick={() => handleTemplateSelect(t.id)}
                            className="flex-1 px-3 py-2.5 text-left min-w-0"
                          >
                            <div className="text-xs font-medium text-neutral-200 truncate">{t.name}</div>
                            <div className="text-[10px] text-neutral-500 mt-0.5 truncate">{t.description}</div>
                          </button>
                          {isUserTemplate(t.id) && (
                            <button
                              onClick={(e) => handleDeleteUserTemplate(t.id, e)}
                              className="px-2 py-2 text-[10px] text-neutral-600 hover:text-red-400 shrink-0"
                              title="Delete template"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <div className="border-t border-wc p-2">
                  {saveTemplateOpen ? (
                    <div className="space-y-2">
                      <input
                        value={newTemplateName}
                        onChange={(e) => { setNewTemplateName(e.target.value); setTemplateError(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTemplate(); if (e.key === 'Escape') setSaveTemplateOpen(false); }}
                        placeholder="Template name"
                        className="w-full bg-wc-input border border-wc rounded px-2 py-1.5 text-xs text-neutral-200 outline-none focus:border-indigo-500"
                        autoFocus
                      />
                      {templateError && (
                        <p className="text-[10px] text-red-400">{templateError}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveTemplate}
                          className="flex-1 px-2 py-1.5 text-[11px] rounded bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setSaveTemplateOpen(false); setNewTemplateName(''); setTemplateError(null); }}
                          className="px-2 py-1.5 text-[11px] rounded bg-wc-elevated text-neutral-400 hover:text-neutral-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSaveTemplateOpen(true)}
                      className="w-full px-3 py-2 text-xs text-indigo-400 hover:bg-wc-hover transition-colors text-left"
                    >
                      + Save current as template
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* CDN Libraries — inject script/link tags into the preview */}
        <div className="relative shrink-0">
          <button
            onClick={() => { setLibMenuOpen(!libMenuOpen); setTemplateMenuOpen(false); }}
            className={`px-2 py-1 text-[11px] rounded-md transition-colors whitespace-nowrap ${
              libMenuOpen ? 'bg-indigo-500/20 text-indigo-300' : 'bg-wc-elevated text-neutral-400 hover:text-neutral-200 hover:bg-wc-hover'
            }`}
            title="Add CDN libraries (Tailwind, GSAP, etc.) to the preview"
          >
            CDN Libs
            {activeLibraries.length > 0 && (
              <span className="ml-1 px-1 text-[9px] rounded-full bg-indigo-500/30 text-indigo-300">{activeLibraries.length}</span>
            )}
          </button>
          {libMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setLibMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-64 bg-wc-surface border border-wc rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-wc">
                  <div className="text-xs font-medium text-neutral-300">CDN Libraries</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Toggle to inject into preview &amp; export</div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {CDN_REGISTRY.map((lib: CDNLibrary) => {
                    const isActive = activeLibraries.some((l) => l.id === lib.id);
                    return (
                      <button
                        key={lib.id}
                        onClick={() => toggleLibrary(lib)}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-wc-hover transition-colors ${
                          isActive ? 'text-indigo-300 bg-indigo-500/10' : 'text-neutral-400'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded border flex items-center justify-center text-[8px] ${
                            isActive ? 'border-indigo-400 bg-indigo-500/30' : 'border-neutral-600'
                          }`}>
                            {isActive ? '✓' : ''}
                          </span>
                          {lib.name}
                          <span className="text-[10px] text-neutral-600">v{lib.version}</span>
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                          lib.category === 'css' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
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

        <div className="w-px h-4 bg-wc-border shrink-0" />

        {isDesktop() && (
          <>
            <button
              onClick={() => void handleDesktopOpen()}
              className="px-2 py-1 text-[11px] rounded-md bg-wc-elevated text-neutral-400 hover:text-neutral-200 hover:bg-wc-hover transition-colors whitespace-nowrap"
              title="Open file (Ctrl+O)"
            >
              Open
            </button>
            <div className="w-px h-4 bg-wc-border shrink-0" />
          </>
        )}

        {/* Share */}
        <div className="relative">
          <button onClick={handleShare}
            className="px-2 py-1 text-[11px] rounded-md bg-wc-elevated text-neutral-400 hover:text-neutral-200 hover:bg-wc-hover transition-colors"
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
        <button
          onClick={handleReset}
          title="Reset to welcome template"
          className={`px-2 py-1 text-[11px] rounded-md transition-colors whitespace-nowrap ${showResetConfirm ? 'bg-red-600 text-white' : 'bg-wc-elevated text-neutral-400 hover:text-red-400 hover:bg-wc-hover'}`}
        >{showResetConfirm ? 'Confirm?' : 'Reset'}</button>

        <div className="w-px h-4 bg-wc-border" />

        {/* Help */}
        <button
          onClick={() => setAboutOpen(true)}
          className="px-2 py-1 text-[11px] rounded-md bg-wc-elevated text-neutral-400 hover:text-neutral-200 hover:bg-wc-hover transition-colors whitespace-nowrap"
          title="About & bug reports"
        >
          About
        </button>
        <button
          onClick={() => setShortcutsOpen(true)}
          className="w-6 h-6 text-[11px] rounded-md bg-wc-elevated text-neutral-500 hover:text-neutral-200 hover:bg-wc-hover transition-colors flex items-center justify-center"
          title="Keyboard shortcuts"
        >
          ?
        </button>
      </div>

      {shortcutsOpen && <ShortcutsModal onClose={() => setShortcutsOpen(false)} />}
      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </nav>
  );
}
