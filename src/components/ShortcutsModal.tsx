import { useEffect } from 'react';
import { TipButton } from './HoverTip';
import { NAV_HINTS } from '../constants/uiHints';

const SHORTCUTS = [
  { keys: 'Ctrl + Enter', action: 'Force refresh preview' },
  { keys: 'Ctrl + \\', action: 'Toggle layout orientation' },
  { keys: 'Ctrl + 1 / 2 / 3', action: 'Focus HTML / CSS / JS pane' },
  { keys: 'Ctrl + Shift + F', action: 'Format active editor' },
  { keys: 'Ctrl + Shift + E', action: 'Export as ZIP' },
  { keys: 'Ctrl + Shift + C', action: 'Toggle console panel' },
  { keys: 'Ctrl + = / -', action: 'Increase / decrease font size' },
  { keys: 'Ctrl + S', action: 'Save project' },
  { keys: 'Ctrl + Shift + S', action: 'Save as (desktop) / Export (web)' },
  { keys: 'Ctrl + O', action: 'Open file (desktop only)' },
  { keys: 'Escape', action: 'Exit fullscreen preview' },
];

export default function ShortcutsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative ui-bg-panel border ui-border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border ui-border">
          <h2 className="text-sm font-semibold ui-text">Keyboard Shortcuts</h2>
          <TipButton
            tip={NAV_HINTS.modalClose}
            shortcut="Escape"
            onClick={onClose}
            className="ui-text-faint hover:ui-text transition-colors text-sm"
          >
            Esc
          </TipButton>
        </div>
        <div className="px-5 py-3 max-h-[60vh] overflow-y-auto">
          {SHORTCUTS.map((s) => (
            <div
              key={s.keys}
              className="flex items-center justify-between py-2 border-b border-[#1b1f27] last:border-b-0"
            >
              <span className="text-xs ui-text-muted">{s.action}</span>
              <kbd className="text-[10px] font-mono px-2 py-1 rounded ui-bg-base border ui-border ui-text shrink-0 ml-3">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
        <div className="px-5 py-2 border-t border ui-border text-[10px] ui-text-faint text-center">
          On macOS, use Cmd instead of Ctrl
        </div>
      </div>
    </div>
  );
}
