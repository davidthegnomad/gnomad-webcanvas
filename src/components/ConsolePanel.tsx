import { useRef, useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';

const METHOD_STYLES: Record<string, { border: string; text: string; bg: string }> = {
  log: { border: 'border-l-neutral-600', text: 'text-neutral-300', bg: '' },
  info: { border: 'border-l-blue-500', text: 'text-blue-300', bg: 'bg-blue-500/5' },
  warn: { border: 'border-l-amber-500', text: 'text-amber-300', bg: 'bg-amber-500/5' },
  error: { border: 'border-l-red-500', text: 'text-red-300', bg: 'bg-red-500/5' },
};

export default function ConsolePanel() {
  const entries = useEditorStore((s) => s.consoleEntries);
  const clearConsole = useEditorStore((s) => s.clearConsole);
  const toggleConsole = useEditorStore((s) => s.toggleConsole);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  const errorCount = entries.filter((e) => e.method === 'error').length;
  const warnCount = entries.filter((e) => e.method === 'warn').length;

  return (
    <div className="flex flex-col h-full bg-[#0d1117] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1 bg-[#161b22] border-b border-[#30363d] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">Console</span>
          <span className="text-[10px] text-neutral-600">{entries.length}</span>
          {errorCount > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
              {errorCount} error{errorCount > 1 ? 's' : ''}
            </span>
          )}
          {warnCount > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
              {warnCount} warn{warnCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearConsole}
            className="text-[10px] px-2 py-0.5 text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={toggleConsole}
            className="text-[10px] px-1 text-neutral-500 hover:text-neutral-300 transition-colors"
            title="Close console"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed">
        {entries.length === 0 && (
          <div className="px-3 py-4 text-neutral-600 text-center text-[10px]">
            No console output yet
          </div>
        )}
        {entries.map((entry) => {
          const style = METHOD_STYLES[entry.method] ?? METHOD_STYLES.log;
          return (
            <div
              key={entry.id}
              className={`px-3 py-1 border-l-2 border-b border-b-[#1b1f27] ${style.border} ${style.text} ${style.bg}`}
            >
              {entry.args.join(' ')}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
