import { useEffect, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

interface DropdownPortalProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  width?: number;
  align?: 'left' | 'right';
}

export default function DropdownPortal({
  open,
  onClose,
  anchorRef,
  children,
  width = 240,
  align = 'right',
}: DropdownPortalProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !anchorRef.current) return;

    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const left =
        align === 'right'
          ? Math.max(8, rect.right - width)
          : Math.min(rect.left, window.innerWidth - width - 8);

      setPosition({ top: rect.bottom + 4, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, anchorRef, width, align]);

  if (!open) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9998]"
        aria-hidden
        onMouseDown={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      <div
        className="fixed z-[9999] ui-bg-menu border ui-border rounded-lg shadow-xl overflow-hidden"
        style={{ top: position.top, left: position.left, width }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}
