interface MenuHintHeaderProps {
  title: string;
  hint: string;
}

/** Visible flavor text at the top of dropdown menus. */
export default function MenuHintHeader({ title, hint }: MenuHintHeaderProps) {
  return (
    <div className="px-3 py-2 border-b border ui-border">
      <p className="text-xs font-medium ui-text-muted">{title}</p>
      <p className="text-[10px] ui-text-faint mt-0.5 leading-relaxed">{hint}</p>
    </div>
  );
}
