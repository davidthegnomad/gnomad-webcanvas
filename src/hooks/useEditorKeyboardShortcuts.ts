import { useCallback, useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';
import type { PaneType } from '../types/editor.types';

export function useEditorKeyboardShortcuts(closePromptOpen: boolean): void {
  const previewFullscreen = useEditorStore((s) => s.previewFullscreen);
  const toggleLayout = useEditorStore((s) => s.toggleLayout);
  const setActivePane = useEditorStore((s) => s.setActivePane);
  const forceRefreshPreview = useEditorStore((s) => s.forceRefreshPreview);
  const togglePreviewFullscreen = useEditorStore((s) => s.togglePreviewFullscreen);
  const increaseFontSize = useEditorStore((s) => s.increaseFontSize);
  const decreaseFontSize = useEditorStore((s) => s.decreaseFontSize);
  const toggleConsole = useEditorStore((s) => s.toggleConsole);

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
    [
      closePromptOpen,
      forceRefreshPreview,
      toggleLayout,
      setActivePane,
      increaseFontSize,
      decreaseFontSize,
      togglePreviewFullscreen,
      previewFullscreen,
      toggleConsole,
    ],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
