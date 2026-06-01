import { Group, Panel, usePanelRef } from 'react-resizable-panels';
import { useEditorStore } from '../store/editorStore';
import CodeEditorPane from './CodeEditorPane';
import PreviewFrame from './PreviewFrame';
import ErrorBoundary from './ErrorBoundary';
import ResizeHandle from './ResizeHandle';
import type { PaneType } from '../types/editor.types';
import { PANE_LABELS, PANE_COLORS } from '../constants/editorConfig';

const PANES: PaneType[] = ['html', 'css', 'js'];

function PaneHeader({
  pane,
  isMaximized,
  onMaximize,
  onActivate,
}: {
  pane: PaneType;
  isMaximized: boolean;
  onMaximize: () => void;
  onActivate: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between px-3 py-1.5 ui-bg-panel border-b border ui-border shrink-0 cursor-pointer select-none"
      onDoubleClick={onMaximize}
      onClick={onActivate}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: PANE_COLORS[pane] }}
        />
        <span className="text-xs font-medium ui-text-muted">
          {PANE_LABELS[pane]}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onMaximize();
        }}
        className="text-[10px] ui-text-faint hover:ui-text transition-colors"
        title={isMaximized ? 'Restore' : 'Maximize'}
      >
        {isMaximized ? '⊟' : '⊞'}
      </button>
    </div>
  );
}

export default function Workspace() {
  const layoutOrientation = useEditorStore((s) => s.layoutOrientation);
  const maximizedPane = useEditorStore((s) => s.maximizedPane);
  const activePane = useEditorStore((s) => s.activePane);
  const previewFullscreen = useEditorStore((s) => s.previewFullscreen);
  const setActivePane = useEditorStore((s) => s.setActivePane);
  const setMaximizedPane = useEditorStore((s) => s.setMaximizedPane);
  const togglePreviewFullscreen = useEditorStore((s) => s.togglePreviewFullscreen);

  const editorsPanelRef = usePanelRef();

  const isVertical = layoutOrientation === 'vertical';

  const renderEditorPanel = (pane: PaneType) => {
    const isMaximized = maximizedPane === pane;
    const isHidden = maximizedPane !== null && !isMaximized;

    return (
      <Panel
        key={pane}
        id={`editor-${pane}`}
        defaultSize="33%"
        minSize="5%"
        collapsible
        style={isHidden ? { display: 'none' } : undefined}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {isVertical && (
            <PaneHeader
              pane={pane}
              isMaximized={isMaximized}
              onMaximize={() => setMaximizedPane(isMaximized ? null : pane)}
              onActivate={() => setActivePane(pane)}
            />
          )}
          <ErrorBoundary fallbackLabel={PANE_LABELS[pane]}>
            <CodeEditorPane pane={pane} />
          </ErrorBoundary>
        </div>
      </Panel>
    );
  };

  const renderVerticalEditors = () => (
    <Group orientation="vertical" id="lv-editors-v">
      {renderEditorPanel('html')}
      <ResizeHandle direction="vertical" />
      {renderEditorPanel('css')}
      <ResizeHandle direction="vertical" />
      {renderEditorPanel('js')}
    </Group>
  );

  const renderHorizontalEditors = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex ui-bg-panel border-b border ui-border shrink-0">
        {PANES.map((pane) => (
          <button
            key={pane}
            onClick={() => setActivePane(pane)}
            className={`px-4 py-2 text-xs font-medium transition-colors relative ${
              activePane === pane
                ? 'text-neutral-100 ui-bg-base'
                : 'ui-text-faint hover:ui-text hover:ui-bg-menu'
            }`}
          >
            <span
              className="inline-block w-2 h-2 rounded-full mr-1.5"
              style={{ backgroundColor: PANE_COLORS[pane] }}
            />
            {PANE_LABELS[pane]}
            {activePane === pane && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
            )}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden relative">
        {PANES.map((pane) => (
          <div
            key={pane}
            className={`absolute inset-0 ${activePane === pane ? '' : 'hidden'}`}
          >
            <ErrorBoundary fallbackLabel={PANE_LABELS[pane]}>
              <CodeEditorPane pane={pane} />
            </ErrorBoundary>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-hidden relative">
      <Group
        orientation={isVertical ? 'horizontal' : 'vertical'}
        id={`lv-main-${isVertical ? 'v' : 'h'}`}
      >
        {/* Editors */}
        {!previewFullscreen && (
          <>
            <Panel
              id="editors-panel"
              defaultSize="50%"
              minSize="15%"
              collapsible
              panelRef={editorsPanelRef}
            >
              {isVertical ? renderVerticalEditors() : renderHorizontalEditors()}
            </Panel>
            <ResizeHandle direction={isVertical ? 'horizontal' : 'vertical'} />
          </>
        )}

        {/* Preview */}
        <Panel id="preview-panel" defaultSize="50%" minSize="20%">
          <div className="flex flex-col h-full overflow-hidden">
            <ErrorBoundary fallbackLabel="Preview">
              <PreviewFrame />
            </ErrorBoundary>
          </div>
        </Panel>
      </Group>

      {/* Fullscreen exit overlay */}
      {previewFullscreen && (
        <button
          onClick={togglePreviewFullscreen}
          className="absolute top-12 right-3 z-30 px-2 py-1 text-[10px] rounded ui-bg-elevated/80 ui-text-muted hover:ui-text hover:bg-[var(--ui-border)] transition-colors backdrop-blur-sm"
        >
          Exit Fullscreen
        </button>
      )}
    </div>
  );
}
