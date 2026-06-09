import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { hintLine } from '../constants/uiHints';

interface HoverTipProps {
  tip: string;
  shortcut?: string;
  children: ReactNode;
  className?: string;
}

/** Wraps a control and shows flavor text on hover. */
export function HoverTip({ tip, shortcut, children, className = '' }: HoverTipProps) {
  return (
    <span className={`group/tip relative inline-flex ${className}`}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-[calc(100%+6px)] z-[10001] hidden group-hover/tip:block w-max max-w-[240px] px-2.5 py-1.5 rounded-md bg-neutral-950/95 border border-neutral-700 text-[10px] text-neutral-200 shadow-xl text-center leading-snug"
      >
        {tip}
        {shortcut && (
          <span className="block text-[9px] text-neutral-500 mt-1 font-mono">{shortcut}</span>
        )}
      </span>
    </span>
  );
}

interface TipButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tip: string;
  shortcut?: string;
}

/** Button with hover flavor text and native title fallback. */
export function TipButton({ tip, shortcut, title, children, className = '', ...props }: TipButtonProps) {
  const fullTitle = title ?? hintLine(tip, shortcut);
  const wrapperClass = className.includes('w-full') ? 'w-full' : '';
  return (
    <HoverTip tip={tip} shortcut={shortcut} className={wrapperClass}>
      <button type="button" title={fullTitle} className={className} {...props}>
        {children}
      </button>
    </HoverTip>
  );
}
