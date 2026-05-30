import { useEffect } from 'react';
import {
  APP_NAME,
  APP_CHANNEL,
  APP_VERSION_LABEL,
  BUG_REPORT_EMAIL,
  STUDIO_NAME,
  STUDIO_URL,
  openExternalUrl,
  buildBugReportMailto,
} from '../constants/appInfo';

interface AboutModalProps {
  onClose: () => void;
}

export default function AboutModal({ onClose }: AboutModalProps) {
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
        className="relative bg-wc-surface border border-wc rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-500/20 mb-4">
            WC
          </div>
          <h2 className="text-base font-semibold text-neutral-100">{APP_NAME}</h2>
          <p className="text-xs text-neutral-500 mt-1">{APP_VERSION_LABEL}</p>
          <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/25">
            {APP_CHANNEL}
          </span>
          <p className="text-sm text-neutral-300 mt-5 leading-relaxed">
            <a
              href={STUDIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-300 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                void openExternalUrl(STUDIO_URL);
              }}
            >
              Built with <span aria-label="love">❤️</span> by {STUDIO_NAME}{' '}
              <span aria-label="llama">🦙</span>
            </a>
          </p>
        </div>

        <div className="px-6 py-4 border-t border-wc bg-wc-app/50">
          <p className="text-xs text-neutral-400 text-center mb-3">
            Found a bug or have feedback?
          </p>
          <a
            href={buildBugReportMailto()}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          >
            Report a Bug
          </a>
          <p className="text-[10px] text-neutral-600 text-center mt-2.5">
            {BUG_REPORT_EMAIL}
          </p>
        </div>

        <div className="px-6 py-3 border-t border-wc flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded-md bg-wc-elevated text-wc-muted hover:text-wc hover:bg-wc-hover transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
