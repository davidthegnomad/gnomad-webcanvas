import type { ReactNode } from 'react';

interface ToolSectionProps {
  label: string;
  hint: string;
  children: ReactNode;
}

/** Floating tool group with a visible label and one-line description. */
export default function ToolSection({ label, hint, children }: ToolSectionProps) {
  return (
    <div className="flex items-center gap-3 shrink-0">
      <div className="min-w-[120px] max-w-[160px] hidden md:block">
        <p className="text-[10px] font-medium ui-text-muted leading-tight">{label}</p>
        <p className="text-[9px] ui-text-faint leading-snug mt-0.5">{hint}</p>
      </div>
      {children}
    </div>
  );
}
