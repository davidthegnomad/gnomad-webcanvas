import { useMemo, useEffect, useCallback } from 'react';
import { Group, Panel } from 'react-resizable-panels';
import { useEditorStore } from '../store/editorStore';
import { useDebounce } from '../hooks/useDebounce';
import { assembleSource } from '../utils/assembleSource';
import { FONT_PAIRINGS } from '../constants/fontPairings';
import ConsolePanel from './ConsolePanel';
import ResizeHandle from './ResizeHandle';
import type { ActiveFontPairing, PreviewBackground, PreviewSandboxMode } from '../types/editor.types';
import { modShortcut } from '../utils/modKeyLabel';

const BG_CLASSES: Record<PreviewBackground, string> = {
  white: 'bg-white',
  dark: 'bg-neutral-900',
  checkerboard: 'bg-checkerboard',
};

const BG_LABELS: Record<PreviewBackground, string> = {
  white: '☀',
  dark: '☾',
  checkerboard: '▦',
};

const VIEWPORT_PRESETS = [
  { label: 'Full', value: null },
  { label: 'Mobile', value: 375 },
  { label: 'Tablet', value: 768 },
  { label: 'Desktop', value: 1024 },
] as const;

export default function PreviewFrame() {
  const htmlCode = useEditorStore((s) => s.htmlCode);
  const cssCode = useEditorStore((s) => s.cssCode);
  const jsCode = useEditorStore((s) => s.jsCode);
  const activeLibraries = useEditorStore((s) => s.activeLibraries);
  const previewPaused = useEditorStore((s) => s.previewPaused);
  const previewKey = useEditorStore((s) => s.previewKey);
  const previewViewport = useEditorStore((s) => s.previewViewport);
  const consoleOpen = useEditorStore((s) => s.consoleOpen);
  const consoleEntries = useEditorStore((s) => s.consoleEntries);

  const fontPairingId = useEditorStore((s) => s.fontPairingId);
  const customHeadingFont = useEditorStore((s) => s.customHeadingFont);
  const customBodyFont = useEditorStore((s) => s.customBodyFont);

  const previewBackground = useEditorStore((s) => s.previewBackground);
  const previewSandbox = useEditorStore((s) => s.previewSandbox);

  const setPreviewViewport = useEditorStore((s) => s.setPreviewViewport);
  const toggleConsole = useEditorStore((s) => s.toggleConsole);
  const addConsoleEntry = useEditorStore((s) => s.addConsoleEntry);
  const cyclePreviewBackground = useEditorStore((s) => s.cyclePreviewBackground);
  const setPreviewSandbox = useEditorStore((s) => s.setPreviewSandbox);

  const sandboxAttr =
    previewSandbox === 'relaxed'
      ? 'allow-scripts allow-forms allow-modals allow-popups allow-same-origin'
      : 'allow-scripts';

  const debouncedHtml = useDebounce(htmlCode, 500);
  const debouncedCss = useDebounce(cssCode, 500);
  const debouncedJs = useDebounce(jsCode, 500);

  const activeFontPairing: ActiveFontPairing | null = useMemo(() => {
    if (fontPairingId) {
      const preset = FONT_PAIRINGS.find((p) => p.id === fontPairingId);
      if (preset) return { headingFont: preset.headingFont, bodyFont: preset.bodyFont };
    }
    if (customHeadingFont && customBodyFont) {
      return { headingFont: customHeadingFont, bodyFont: customBodyFont };
    }
    return null;
  }, [fontPairingId, customHeadingFont, customBodyFont]);

  const assembledSource = useMemo(() => {
    if (previewPaused) return null;
    return assembleSource(debouncedHtml, debouncedCss, debouncedJs, activeLibraries, activeFontPairing);
  }, [debouncedHtml, debouncedCss, debouncedJs, activeLibraries, previewPaused, activeFontPairing]);

  const handleMessage = useCallback(
    (e: MessageEvent) => {
      if (e.data?.type === 'liveview-console') {
        addConsoleEntry(e.data.method, e.data.args);
      }
    },
    [addConsoleEntry],
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  const errorCount = consoleEntries.filter((e) => e.method === 'error').length;

  if (previewPaused) {
    return (
      <div className="flex flex-col h-full">
        <PreviewHeader
          viewport={previewViewport}
          onViewportChange={setPreviewViewport}
          consoleOpen={consoleOpen}
          onToggleConsole={toggleConsole}
          errorCount={errorCount}
          background={previewBackground}
          onCycleBackground={cyclePreviewBackground}
          sandboxMode={previewSandbox}
          onToggleSandbox={() =>
            setPreviewSandbox(previewSandbox === 'strict' ? 'relaxed' : 'strict')
          }
        />
        <div className="flex-1 flex items-center justify-center ui-bg-base">
          <div className="text-center">
            <div className="text-3xl mb-3 opacity-40">||</div>
            <p className="text-sm ui-text-faint">Preview paused</p>
            <p className="text-xs ui-text-faint mt-1">
              Press <kbd className="px-1.5 py-0.5 ui-bg-elevated rounded text-[10px]">{modShortcut('Enter')}</kbd> to force refresh
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PreviewHeader
        viewport={previewViewport}
        onViewportChange={setPreviewViewport}
        consoleOpen={consoleOpen}
        onToggleConsole={toggleConsole}
        errorCount={errorCount}
        background={previewBackground}
        onCycleBackground={cyclePreviewBackground}
        sandboxMode={previewSandbox}
        onToggleSandbox={() =>
          setPreviewSandbox(previewSandbox === 'strict' ? 'relaxed' : 'strict')
        }
      />
      <Group orientation="vertical" id="lv-preview-console">
        <Panel id="preview-iframe" defaultSize="70%" minSize="30%">
          <div className={`h-full ${previewViewport ? 'overflow-auto flex items-start justify-center p-2' : ''} ${BG_CLASSES[previewBackground]}`}>
            {previewViewport ? (
              <div
                className="bg-white rounded shadow-lg overflow-hidden shrink-0"
                style={{ width: previewViewport, height: '100%' }}
              >
                <iframe
                  key={previewKey}
                  title="Live Preview"
                  srcDoc={assembledSource ?? ''}
                  sandbox={sandboxAttr}
                  className="w-full h-full border-none"
                />
              </div>
            ) : (
              <iframe
                key={previewKey}
                title="Live Preview"
                srcDoc={assembledSource ?? ''}
                sandbox={sandboxAttr}
                className="w-full h-full border-none"
              />
            )}
          </div>
        </Panel>
        {consoleOpen && (
          <>
            <ResizeHandle direction="vertical" />
            <Panel id="console-panel" defaultSize="30%" minSize="10%" maxSize="60%">
              <ConsolePanel />
            </Panel>
          </>
        )}
      </Group>
    </div>
  );
}

function PreviewHeader({
  viewport,
  onViewportChange,
  consoleOpen,
  onToggleConsole,
  errorCount,
  background,
  onCycleBackground,
  sandboxMode,
  onToggleSandbox,
}: {
  viewport: number | null;
  onViewportChange: (v: number | null) => void;
  consoleOpen: boolean;
  onToggleConsole: () => void;
  errorCount: number;
  background: PreviewBackground;
  onCycleBackground: () => void;
  sandboxMode: PreviewSandboxMode;
  onToggleSandbox: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 ui-bg-panel border-b border ui-border shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium ui-text-muted">Preview</span>
        </div>
        <div className="flex items-center gap-0.5 ml-2">
          {VIEWPORT_PRESETS.map((vp) => (
            <button
              key={vp.label}
              onClick={() => onViewportChange(vp.value)}
              className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                viewport === vp.value
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'ui-text-faint hover:ui-text-muted'
              }`}
            >
              {vp.label}
              {vp.value && <span className="ml-0.5 text-[9px] opacity-60">{vp.value}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleSandbox}
          className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
            sandboxMode === 'relaxed'
              ? 'bg-amber-500/20 text-amber-400'
              : 'ui-text-faint hover:ui-text-muted'
          }`}
          title={
            sandboxMode === 'strict'
              ? 'Strict sandbox (scripts only). Click for relaxed mode (forms, popups).'
              : 'Relaxed sandbox — less isolation; use only with trusted HTML.'
          }
        >
          {sandboxMode === 'strict' ? 'Sandbox' : 'Relaxed'}
        </button>
        <button
          onClick={onCycleBackground}
          className="px-2 py-0.5 text-[10px] rounded ui-text-faint hover:ui-text-muted transition-colors"
          title={`Preview background: ${background}`}
        >
          {BG_LABELS[background]}
        </button>
      </div>

      <button
        onClick={onToggleConsole}
        className={`flex items-center gap-1 px-2 py-0.5 text-[10px] rounded transition-colors ${
          consoleOpen
            ? 'bg-indigo-500/20 text-indigo-300'
            : 'ui-text-faint hover:ui-text-muted'
        }`}
      >
        Console
        {errorCount > 0 && (
          <span className="px-1 py-0.5 text-[9px] rounded-full bg-red-500/30 text-red-400 min-w-[16px] text-center">
            {errorCount}
          </span>
        )}
      </button>
    </div>
  );
}
